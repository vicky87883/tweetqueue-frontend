import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (!isProd ? 'dev-only-jwt-secret-do-not-use-in-production' : '');
const BCRYPT_ROUNDS = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const MAIL_REQUIRE_VERIFICATION = process.env.MAIL_REQUIRE_VERIFICATION !== 'false';
const X_ORIGIN = process.env.X_AUTHORIZE_ORIGIN || 'https://x.com';
const X_API = process.env.X_API_BASE_URL || 'https://api.x.com';
const SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'].join(' ');
const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const emailOf = (value: unknown) => trim(value).toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const randomToken = () => crypto.randomBytes(32).toString('base64url');
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const b64url = (value: Buffer) => value.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const randomId = (bytes = 32) => b64url(crypto.randomBytes(bytes));
const challengeFor = (value: string) => b64url(crypto.createHash('sha256').update(value).digest());
const appUrl = () => trim(process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const apiUrl = () => appUrl();
const redirectUri = () => trim(process.env.X_REDIRECT_URI || `${apiUrl()}/api/backend/api/x/callback`);
const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const textArray = (value: unknown) => (Array.isArray(value) ? value : []);
const slugify = (value: string) => trim(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ENC_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || JWT_SECRET || 'dev-key').digest();

function databaseInfo() {
  const raw = trim(process.env.DATABASE_URL);
  if (!raw) return { configured: false };

  try {
    const url = new URL(raw);
    return {
      configured: true,
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port || '3306',
      user: decodeURIComponent(url.username),
      database: url.pathname.replace(/^\//, ''),
    };
  } catch {
    return { configured: true, invalidUrl: true };
  }
}

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

type AuthedUser = {
  userId: string;
  email: string;
};

function seal(value: unknown) {
  const text = trim(value);
  if (!text) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join(':');
}

function open(value: string | null | undefined) {
  if (!value || !value.startsWith('v1:')) return value || null;
  const parts = value.split(':');
  if (parts.length !== 4) return null;
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, Buffer.from(parts[1], 'base64'));
  decipher.setAuthTag(Buffer.from(parts[2], 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(parts[3], 'base64')), decipher.final()]).toString('utf8');
}

function sign(user: { id: string; email: string }) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production.');
  }

  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function auth(request: NextRequest): AuthedUser | NextResponse {
  if (!JWT_SECRET) {
    return json({ error: 'JWT_SECRET must be configured.' }, 503);
  }

  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return json({ error: 'Access token required' }, 401);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return { userId: String(payload.userId), email: String(payload.email || '').toLowerCase() };
  } catch {
    return json({ error: 'Invalid token' }, 403);
  }
}

function mailerReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function assertMailerReady() {
  if (MAIL_REQUIRE_VERIFICATION && !mailerReady()) {
    throw new Error('Mail is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM or set MAIL_REQUIRE_VERIFICATION=false.');
  }
}

function createTransport() {
  if (!mailerReady()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendVerificationEmail(user: { id: string; name: string; email: string }) {
  if (!MAIL_REQUIRE_VERIFICATION) return;
  const transport = createTransport();
  if (!transport) throw new Error('Mail is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM.');
  const token = randomToken();
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  const verifyUrl = `${apiUrl()}/api/backend/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Verify your TweetQueue email',
    text: `Hi ${user.name}, verify your TweetQueue account: ${verifyUrl}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111"><h2>Verify your TweetQueue account</h2><p>Hi ${user.name},</p><p>Confirm your email to activate your workspace.</p><p><a href="${verifyUrl}" style="display:inline-block;background:#1DA1F2;color:#000;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none">Verify email</a></p><p>This link expires in 24 hours.</p></div>`,
  });
}

async function bodyJson(request: NextRequest) {
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

function serializePost(post: any) {
  return {
    id: post.id,
    text: post.text,
    scheduledAt: post.scheduledAt,
    status: post.status,
    xPostId: post.xPostId,
    error: post.error,
    publishedAt: post.publishedAt,
    hasMedia: Boolean(post.mediaData),
    mediaPreview: post.mediaPreview || null,
    mediaMimeType: post.mediaMimeType || null,
    mediaAspectRatio: post.mediaAspectRatio || null,
  };
}

function serializeBlogPost(post: any) {
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle || post.title,
    description: post.description,
    category: post.category,
    readTime: post.readTime,
    date: (post.publishedAt || post.createdAt).toISOString().slice(0, 10),
    image: post.image || '/dashboard-preview.svg',
    intro: post.intro,
    sections: textArray(post.sections),
    checklist: textArray(post.checklist),
  };
}

function serializeJob(job: any) {
  return {
    slug: job.slug,
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.type,
    salary: job.salary,
    postedAt: job.postedAt.toISOString().slice(0, 10),
    validThrough: job.validThrough ? job.validThrough.toISOString().slice(0, 10) : '',
    summary: job.summary,
    responsibilities: textArray(job.responsibilities),
    requirements: textArray(job.requirements),
  };
}

function validateMedia(body: Record<string, unknown>) {
  const mediaData = trim(body.mediaData);
  const mediaPreview = trim(body.mediaPreview);
  const mediaMimeType = trim(body.mediaMimeType);
  const mediaAspectRatio = trim(body.mediaAspectRatio);
  if (!mediaData) return { mediaData: null, mediaPreview: null, mediaMimeType: null, mediaAspectRatio: null };
  if (!ALLOWED_MEDIA_TYPES.has(mediaMimeType)) return { error: 'Image must be JPEG, PNG, WEBP, or GIF.' };
  if (!['16:9', '1:1'].includes(mediaAspectRatio)) return { error: 'Image aspect ratio must be 16:9 or 1:1.' };
  const bytes = Buffer.from(mediaData, 'base64');
  if (!bytes.length) return { error: 'Image data is empty.' };
  if (bytes.length > MAX_MEDIA_BYTES) return { error: 'Image must be 5 MB or smaller.' };
  return { mediaData, mediaPreview: mediaPreview || null, mediaMimeType, mediaAspectRatio };
}

async function tokenRequest(params: Record<string, string>) {
  const clientId = trim(process.env.X_CLIENT_ID);
  const clientSecret = trim(process.env.X_CLIENT_SECRET);
  if (!clientId) throw new Error('X_CLIENT_ID is not configured.');
  const body = new URLSearchParams(params);
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (clientSecret) headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  else body.set('client_id', clientId);
  const response = await fetch(`${X_API}/2/oauth2/token`, { method: 'POST', headers, body });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error_description || data?.error || data?.detail || 'X token request failed');
  return data;
}

async function getProfile(token: string) {
  const response = await fetch(`${X_API}/2/users/me?user.fields=username,name,profile_image_url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || data?.title || 'Could not read X profile');
  return data.data;
}

async function usableToken(account: any) {
  const expires = account.tokenExpiresAt ? new Date(account.tokenExpiresAt).getTime() : 0;
  if (expires && expires - Date.now() < 120000 && account.refreshToken) {
    const data = await tokenRequest({ grant_type: 'refresh_token', refresh_token: open(account.refreshToken) || '' });
    await prisma.xAccount.update({
      where: { id: account.id },
      data: {
        accessToken: seal(data.access_token) || '',
        refreshToken: data.refresh_token ? seal(data.refresh_token) : account.refreshToken,
        tokenExpiresAt: data.expires_in ? new Date(Date.now() + Number(data.expires_in) * 1000) : account.tokenExpiresAt,
        scope: data.scope || account.scope,
      },
    });
    return data.access_token;
  }
  return open(account.accessToken) || '';
}

async function uploadMediaToX(token: string, base64Data: string, mimeType: string) {
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > MAX_MEDIA_BYTES) throw new Error('Image must be 5 MB or smaller.');
  const form = new FormData();
  form.append('media', new Blob([buffer], { type: mimeType }), 'tweet-image');
  form.append('media_category', 'tweet_image');
  const response = await fetch(`${X_API}/2/media/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || data?.title || data?.error || 'X media upload failed');
  const mediaId = data?.data?.id || data?.media_id_string;
  if (!mediaId) throw new Error('X media upload did not return a media id.');
  return String(mediaId);
}

async function publish(post: any) {
  const token = await usableToken(post.xAccount);
  const mediaIds = post.mediaData && post.mediaMimeType ? [await uploadMediaToX(token, post.mediaData, post.mediaMimeType)] : [];
  const payload: Record<string, unknown> = { text: post.text || '' };
  if (mediaIds.length) payload.media = { media_ids: mediaIds };
  const response = await fetch(`${X_API}/2/tweets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || data?.title || data?.error || 'X publish failed');
  return data.data;
}

async function claimPost(id: string, userId: string) {
  const result = await prisma.scheduledPost.updateMany({ where: { id, userId, status: { in: ['scheduled', 'failed'] } }, data: { status: 'publishing', error: null } });
  if (result.count === 0) return null;
  return prisma.scheduledPost.findUnique({ where: { id }, include: { xAccount: true } });
}

async function publishClaimedPost(post: any) {
  try {
    const result = await publish(post);
    await prisma.scheduledPost.update({ where: { id: post.id }, data: { status: 'published', publishedAt: new Date(), xPostId: result?.id || null, error: null } });
    return { id: post.id, status: 'published' };
  } catch (error) {
    await prisma.scheduledPost.update({ where: { id: post.id }, data: { status: 'failed', error: error instanceof Error ? error.message : 'Publish failed' } });
    return { id: post.id, status: 'failed' };
  }
}

async function processDueScheduledPosts(limit = 10) {
  const due = await prisma.scheduledPost.findMany({ where: { status: 'scheduled', scheduledAt: { lte: new Date() } }, orderBy: { scheduledAt: 'asc' }, take: limit });
  const results = [];
  for (const item of due) {
    const post = await claimPost(item.id, item.userId);
    if (post) results.push(await publishClaimedPost(post));
  }
  return results;
}

function requireContentAdmin(request: NextRequest) {
  const expected = process.env.CONTENT_ADMIN_SECRET;
  if (!expected) return json({ error: 'CONTENT_ADMIN_SECRET is not configured.' }, 503);
  if (request.headers.get('x-content-admin-secret') !== expected) return json({ error: 'Unauthorized' }, 401);
  return null;
}

function blogData(body: Record<string, unknown>) {
  const title = trim(body.title);
  return {
    slug: slugify(trim(body.slug) || title),
    title,
    seoTitle: trim(body.seoTitle) || title,
    description: trim(body.description),
    category: trim(body.category) || 'Updates',
    readTime: trim(body.readTime) || '5 min read',
    image: trim(body.image) || '/dashboard-preview.svg',
    intro: trim(body.intro) || trim(body.description),
    sections: textArray(body.sections),
    checklist: textArray(body.checklist),
    status: trim(body.status) || 'draft',
    publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : trim(body.status) === 'published' ? new Date() : null,
  };
}

function jobData(body: Record<string, unknown>) {
  const title = trim(body.title);
  return {
    slug: slugify(trim(body.slug) || title),
    title,
    department: trim(body.department) || 'Product',
    location: trim(body.location) || 'Remote',
    type: trim(body.type) || 'full-time',
    salary: trim(body.salary) || 'Competitive',
    summary: trim(body.summary),
    responsibilities: textArray(body.responsibilities),
    requirements: textArray(body.requirements),
    status: trim(body.status) || 'open',
    postedAt: body.postedAt ? new Date(String(body.postedAt)) : new Date(),
    validThrough: body.validThrough ? new Date(String(body.validThrough)) : null,
  };
}

async function handle(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const rawPath = params.path || [];
    const path = `/${rawPath.join('/')}`.replace(/^\/api\/backend/, '');
    const method = request.method;
    const url = new URL(request.url);

    if (method === 'GET' && (path === '/' || path === '/api/health')) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return json({ service: 'tweetqueue', status: 'ok', database: true, integrated: true, databaseInfo: databaseInfo() });
      } catch (error) {
        const message = error instanceof Error ? error.message.split('\n').filter(Boolean).at(-1) : 'Database connection failed';
        return json({ service: 'tweetqueue', status: 'error', database: false, integrated: true, databaseInfo: databaseInfo(), error: message }, 503);
      }
    }

    if (method === 'POST' && path === '/api/auth/register') {
      const body = await bodyJson(request);
      const name = trim(body.name);
      const email = emailOf(body.email);
      const password = typeof body.password === 'string' ? body.password : '';
      if (!name || name.length > 80) return json({ error: 'Name is required' }, 400);
      if (!email || !validEmail(email)) return json({ error: 'Enter a valid email address' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      assertMailerReady();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return json({ error: 'User already exists' }, 409);
      const user = await prisma.user.create({
        data: { name, email, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS), emailVerified: !MAIL_REQUIRE_VERIFICATION, emailVerifiedAt: MAIL_REQUIRE_VERIFICATION ? null : new Date() },
        select: { id: true, name: true, email: true, emailVerified: true },
      });
      try {
        await sendVerificationEmail(user);
      } catch (error) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => null);
        throw error;
      }
      if (MAIL_REQUIRE_VERIFICATION) return json({ success: true, verificationRequired: true, message: 'Account created. Check your email to verify your account before signing in.' }, 201);
      return json({ success: true, token: sign(user), user: { id: user.id, name: user.name, email: user.email } }, 201);
    }

    if (method === 'POST' && path === '/api/auth/login') {
      const body = await bodyJson(request);
      const email = emailOf(body.email);
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !validEmail(email) || !password) return json({ error: 'Email and password are required' }, 400);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) return json({ error: 'Invalid credentials' }, 401);
      if (MAIL_REQUIRE_VERIFICATION && !user.emailVerified) return json({ error: 'Please verify your email before signing in.' }, 403);
      const loggedInUser = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() }, select: { id: true, name: true, email: true } });
      return json({ success: true, token: sign(loggedInUser), user: loggedInUser });
    }

    if (method === 'GET' && path === '/api/auth/me') {
      const userAuth = auth(request);
      if (userAuth instanceof NextResponse) return userAuth;
      const user = await prisma.user.findUnique({ where: { id: userAuth.userId }, select: { id: true, name: true, email: true, emailVerified: true } });
      if (!user) return json({ error: 'User not found' }, 401);
      return json({ success: true, user });
    }

    if (method === 'POST' && path === '/api/auth/resend-verification') {
      const body = await bodyJson(request);
      const email = emailOf(body.email);
      if (!email || !validEmail(email)) return json({ error: 'Enter a valid email address' }, 400);
      assertMailerReady();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.emailVerified) return json({ success: true });
      await sendVerificationEmail(user);
      return json({ success: true, message: 'Verification email sent.' });
    }

    if (method === 'GET' && path === '/api/auth/verify-email') {
      const token = trim(url.searchParams.get('token'));
      const row = token ? await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } }) : null;
      if (!row || row.usedAt || row.expiresAt < new Date()) return NextResponse.redirect(`${appUrl()}/verify-email?status=invalid`);
      await prisma.$transaction([
        prisma.user.update({ where: { id: row.userId }, data: { emailVerified: true, emailVerifiedAt: new Date() } }),
        prisma.emailVerificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      ]);
      return NextResponse.redirect(`${appUrl()}/verify-email?status=verified`);
    }

    const userAuth = auth(request);
    const authed = !(userAuth instanceof NextResponse) ? userAuth : null;

    if (method === 'GET' && path === '/api/keys' && authed) {
      const row = await prisma.apiKeys.findUnique({ where: { userId: authed.userId } });
      if (!row) return json({});
      const mask = (value: string | null) => (!value ? null : value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : '****');
      return json({ apiKey: mask(open(row.apiKey)), accessToken: mask(open(row.accessToken)) });
    }

    if (method === 'POST' && path === '/api/keys' && authed) {
      const body = await bodyJson(request);
      const apiKey = trim(body.apiKey);
      const apiSecret = trim(body.apiSecret);
      if (!apiKey || !apiSecret) return json({ error: 'apiKey and apiSecret are required' }, 400);
      await prisma.apiKeys.upsert({
        where: { userId: authed.userId },
        create: { userId: authed.userId, apiKey: seal(apiKey) || '', apiSecret: seal(apiSecret) || '', accessToken: seal(body.accessToken), accessSecret: seal(body.accessSecret) },
        update: { apiKey: seal(apiKey) || '', apiSecret: seal(apiSecret) || '', accessToken: seal(body.accessToken), accessSecret: seal(body.accessSecret) },
      });
      return json({ success: true });
    }

    if (method === 'POST' && path === '/api/test-connection' && authed) {
      const row = await prisma.xAccount.findUnique({ where: { userId: authed.userId }, select: { username: true } });
      return json(row ? { success: true, message: `Connected to @${row.username}` } : { success: false, message: 'Connect your X account first.' });
    }

    if (method === 'GET' && path === '/api/x/status' && authed) {
      const account = await prisma.xAccount.findUnique({ where: { userId: authed.userId }, select: { id: true, xUserId: true, username: true, name: true, profileImageUrl: true, updatedAt: true } });
      return json({ connected: Boolean(account), account });
    }

    if (method === 'POST' && path === '/api/x/connect' && authed) {
      const clientId = trim(process.env.X_CLIENT_ID);
      if (!clientId) return json({ error: 'Set X_CLIENT_ID first.' }, 503);
      await prisma.xOAuthState.deleteMany({ where: { userId: authed.userId, expiresAt: { lt: new Date() } } });
      const state = randomId(24);
      const verifier = randomId(48);
      await prisma.xOAuthState.create({ data: { userId: authed.userId, state, codeVerifier: verifier, expiresAt: new Date(Date.now() + 600000) } });
      const authUrl = new URL(`${X_ORIGIN}/i/oauth2/authorize`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri());
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', challengeFor(verifier));
      authUrl.searchParams.set('code_challenge_method', 'S256');
      return json({ authUrl: authUrl.toString() });
    }

    if (method === 'GET' && path === '/api/x/callback') {
      const code = url.searchParams.get('code') || '';
      const state = url.searchParams.get('state') || '';
      const saved = await prisma.xOAuthState.findUnique({ where: { state } });
      if (!code || !saved || saved.expiresAt < new Date()) return NextResponse.redirect(`${appUrl()}/scheduler?x=failed`);
      const tokens = await tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(), code_verifier: saved.codeVerifier });
      const profile = await getProfile(tokens.access_token);
      await prisma.xAccount.upsert({
        where: { userId: saved.userId },
        create: { userId: saved.userId, xUserId: profile.id, username: profile.username || '', name: profile.name || '', profileImageUrl: profile.profile_image_url || null, accessToken: seal(tokens.access_token) || '', refreshToken: seal(tokens.refresh_token || ''), tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000) : null, scope: tokens.scope || SCOPES },
        update: { xUserId: profile.id, username: profile.username || '', name: profile.name || '', profileImageUrl: profile.profile_image_url || null, accessToken: seal(tokens.access_token) || '', refreshToken: seal(tokens.refresh_token || ''), tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + Number(tokens.expires_in) * 1000) : null, scope: tokens.scope || SCOPES },
      });
      await prisma.xOAuthState.delete({ where: { state } }).catch(() => null);
      return NextResponse.redirect(`${appUrl()}/scheduler?x=connected`);
    }

    if (method === 'DELETE' && path === '/api/x/disconnect' && authed) {
      await prisma.xAccount.delete({ where: { userId: authed.userId } }).catch(() => null);
      return json({ success: true });
    }

    if (method === 'POST' && path === '/api/scheduled-posts' && authed) {
      const body = await bodyJson(request);
      const postText = trim(body.text);
      const scheduledAt = new Date(String(body.scheduledAt || ''));
      const media = validateMedia(body);
      if ('error' in media) return json({ error: media.error }, 400);
      if (!postText && !media.mediaData) return json({ error: 'Add post text, an image, or both.' }, 400);
      if (postText.length > 280) return json({ error: 'Post text must be 280 characters or fewer.' }, 400);
      if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 60000) return json({ error: 'Choose a future time at least 1 minute ahead.' }, 400);
      const account = await prisma.xAccount.findUnique({ where: { userId: authed.userId } });
      if (!account) return json({ error: 'Connect X before scheduling.' }, 400);
      const post = await prisma.scheduledPost.create({ data: { userId: authed.userId, xAccountId: account.id, text: postText, scheduledAt, status: 'scheduled', mediaData: media.mediaData, mediaPreview: media.mediaPreview, mediaMimeType: media.mediaMimeType, mediaAspectRatio: media.mediaAspectRatio } });
      return json({ success: true, post: serializePost(post) }, 201);
    }

    if (method === 'GET' && path === '/api/scheduled-posts' && authed) {
      const posts = await prisma.scheduledPost.findMany({ where: { userId: authed.userId }, orderBy: { scheduledAt: 'asc' }, take: 100 });
      return json({ success: true, posts: posts.map(serializePost) });
    }

    const scheduledId = path.match(/^\/api\/scheduled-posts\/([^/]+)$/)?.[1];
    if (method === 'DELETE' && scheduledId && authed) {
      const deleted = await prisma.scheduledPost.deleteMany({ where: { id: scheduledId, userId: authed.userId, status: { in: ['scheduled', 'failed'] } } });
      if (deleted.count === 0) return json({ error: 'Scheduled post not found or already published.' }, 404);
      return json({ success: true });
    }

    const publishNowId = path.match(/^\/api\/scheduled-posts\/([^/]+)\/publish-now$/)?.[1];
    if (method === 'POST' && publishNowId && authed) {
      const post = await claimPost(publishNowId, authed.userId);
      if (!post) return json({ error: 'Post not found or already being processed.' }, 404);
      const result = await publishClaimedPost(post);
      const updated = await prisma.scheduledPost.findUnique({ where: { id: post.id } });
      return json({ success: result.status === 'published', result, post: updated ? serializePost(updated) : null });
    }

    if (method === 'POST' && path === '/api/scheduled-posts/publish-due') {
      const secret = process.env.CRON_SECRET;
      if (secret && (request.headers.get('authorization') || '').replace('Bearer ', '') !== secret) return json({ error: 'Unauthorized' }, 401);
      const results = await processDueScheduledPosts(10);
      return json({ success: true, processed: results.length, results });
    }

    if (method === 'GET' && path === '/api/blog-posts') {
      const posts = await prisma.blogPost.findMany({ where: { status: 'published' }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take: 100 });
      return json({ success: true, posts: posts.map(serializeBlogPost) });
    }

    const blogSlug = path.match(/^\/api\/blog-posts\/([^/]+)$/)?.[1];
    if (method === 'GET' && blogSlug) {
      const post = await prisma.blogPost.findFirst({ where: { slug: blogSlug, status: 'published' } });
      if (!post) return json({ error: 'Blog post not found' }, 404);
      return json({ success: true, post: serializeBlogPost(post) });
    }

    if (method === 'GET' && path === '/api/jobs') {
      const jobs = await prisma.jobOpening.findMany({ where: { status: 'open' }, orderBy: { postedAt: 'desc' }, take: 100 });
      return json({ success: true, jobs: jobs.map(serializeJob) });
    }

    const jobSlug = path.match(/^\/api\/jobs\/([^/]+)$/)?.[1];
    if (method === 'GET' && jobSlug) {
      const job = await prisma.jobOpening.findFirst({ where: { slug: jobSlug, status: 'open' } });
      if (!job) return json({ error: 'Job opening not found' }, 404);
      return json({ success: true, job: serializeJob(job) });
    }

    const adminBlogSlug = path.match(/^\/api\/admin\/blog-posts\/([^/]+)$/)?.[1];
    if (path === '/api/admin/blog-posts' || adminBlogSlug) {
      const adminError = requireContentAdmin(request);
      if (adminError) return adminError;
      const body = ['POST', 'PUT'].includes(method) ? await bodyJson(request) : {};
      if (method === 'POST' && path === '/api/admin/blog-posts') {
        const data = blogData(body);
        if (!data.title || !data.description || !data.intro) return json({ error: 'title, description, and intro are required.' }, 400);
        const post = await prisma.blogPost.create({ data });
        return json({ success: true, post }, 201);
      }
      if (method === 'PUT' && adminBlogSlug) return json({ success: true, post: await prisma.blogPost.update({ where: { slug: adminBlogSlug }, data: blogData(body) }) });
      if (method === 'DELETE' && adminBlogSlug) {
        await prisma.blogPost.delete({ where: { slug: adminBlogSlug } });
        return json({ success: true });
      }
    }

    const adminJobSlug = path.match(/^\/api\/admin\/jobs\/([^/]+)$/)?.[1];
    if (path === '/api/admin/jobs' || adminJobSlug) {
      const adminError = requireContentAdmin(request);
      if (adminError) return adminError;
      const body = ['POST', 'PUT'].includes(method) ? await bodyJson(request) : {};
      if (method === 'POST' && path === '/api/admin/jobs') {
        const data = jobData(body);
        if (!data.title || !data.summary) return json({ error: 'title and summary are required.' }, 400);
        const job = await prisma.jobOpening.create({ data });
        return json({ success: true, job }, 201);
      }
      if (method === 'PUT' && adminJobSlug) return json({ success: true, job: await prisma.jobOpening.update({ where: { slug: adminJobSlug }, data: jobData(body) }) });
      if (method === 'DELETE' && adminJobSlug) {
        await prisma.jobOpening.delete({ where: { slug: adminJobSlug } });
        return json({ success: true });
      }
    }

    if (userAuth instanceof NextResponse) return userAuth;
    return json({ error: 'Route not found' }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: isProd ? 'Internal server error' : error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
