import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (!isProd ? 'dev-only-jwt-secret-do-not-use-in-production' : '');

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const emailOf = (value: unknown) => trim(value).toLowerCase();

function adminPasswordMatches(password: string) {
  const hash = trim(process.env.ADMIN_PASSWORD_HASH);
  if (hash) return bcrypt.compare(password, hash);

  const plain = trim(process.env.ADMIN_PASSWORD);
  if (!plain) return Promise.resolve(false);
  return Promise.resolve(password === plain);
}

export async function POST(request: NextRequest) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'JWT_SECRET must be configured.' }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email = emailOf(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const expectedEmail = emailOf(process.env.ADMIN_EMAIL || 'admin@tweetqueue.com');

    if (!expectedEmail || !email || !password) {
      return NextResponse.json({ error: 'Admin email and password are required.' }, { status: 400 });
    }

    if (email !== expectedEmail || !(await adminPasswordMatches(password))) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const user = { id: 'admin', name: 'TweetQueue Admin', email: expectedEmail, role: 'admin' as const };
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return NextResponse.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: isProd ? 'Internal server error' : error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
