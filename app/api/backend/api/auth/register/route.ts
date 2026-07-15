import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/server/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BCRYPT_ROUNDS = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizeEmail = (value: unknown) => trim(value).toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function mailerReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function verificationEnabled() {
  return process.env.MAIL_REQUIRE_VERIFICATION !== 'false' && mailerReady();
}

function appUrl(request: NextRequest) {
  return trim(process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL) || request.nextUrl.origin;
}

async function sendVerificationEmail(
  request: NextRequest,
  user: { id: string; name: string; email: string }
) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const token = crypto.randomBytes(32).toString('base64url');
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${appUrl(request).replace(/\/$/, '')}/api/backend/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Verify your TweetQueue email',
    text: `Hi ${user.name}, verify your TweetQueue account: ${verifyUrl}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>Verify your TweetQueue account</h2><p>Hi ${user.name},</p><p>Confirm your email to activate your workspace.</p><p><a href="${verifyUrl}" style="display:inline-block;background:#1DA1F2;color:#000;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none">Verify email</a></p><p>This link expires in 24 hours.</p></div>`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = trim(body.name);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || name.length > 80) {
      return json({ error: 'Name is required and must be 80 characters or fewer.' }, 400);
    }

    if (!email || !validEmail(email)) {
      return json({ error: 'Enter a valid email address.' }, 400);
    }

    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters.' }, 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ error: 'An account with this email already exists.' }, 409);
    }

    const requiresVerification = verificationEnabled();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        emailVerified: !requiresVerification,
        emailVerifiedAt: requiresVerification ? null : new Date(),
      },
      select: { id: true, name: true, email: true },
    });

    if (requiresVerification) {
      try {
        await sendVerificationEmail(request, user);
      } catch (error) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
        console.error('TweetQueue verification email failed:', error);
        return json(
          {
            error:
              'We could not send the verification email. Please check the SMTP settings and try again.',
          },
          503
        );
      }

      return json(
        {
          success: true,
          verificationRequired: true,
          message: 'Account created. Check your email to verify your account before signing in.',
        },
        201
      );
    }

    return json(
      {
        success: true,
        verificationRequired: false,
        message: mailerReady()
          ? 'Account created. You can now sign in.'
          : 'Account created. Email verification is temporarily disabled; you can now sign in.',
      },
      201
    );
  } catch (error) {
    console.error('TweetQueue registration failed:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return json({ error: 'An account with this email already exists.' }, 409);
      }

      if (error.code === 'P2021' || error.code === 'P2022') {
        return json(
          {
            error:
              'The database schema is not ready. Run the Prisma database deployment command and try again.',
          },
          503
        );
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return json(
        {
          error:
            'The database is unavailable. Check DATABASE_URL and the database server connection.',
        },
        503
      );
    }

    return json(
      {
        error: 'Account creation failed because the server is not fully configured. Please try again shortly.',
      },
      500
    );
  }
}
