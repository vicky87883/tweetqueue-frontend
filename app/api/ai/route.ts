import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type TrialState = {
  count: number;
  resetAt: number;
};

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_BACKEND_URL = 'https://tweetqueue-1.onrender.com';
const TRIAL_COOKIE = 'xq_xschedular_trial';
const TRIAL_WINDOW_DAYS = 30;
const RAW_TRIAL_LIMIT = Number.parseInt(process.env.XSCHEDULAR_TRIAL_LIMIT || '4', 10);
const TRIAL_LIMIT =
  Number.isInteger(RAW_TRIAL_LIMIT) && RAW_TRIAL_LIMIT > 0 && RAW_TRIAL_LIMIT <= 10
    ? RAW_TRIAL_LIMIT
    : 4;

const XSCHEDULAR_SYSTEM_PROMPT = [
  'You are xschedular, a concise, practical assistant for TweetQueue, an X bulk scheduling tool.',
  'Help with content planning, queue hygiene, analytics, creator workflows, hooks, posting calendars, and content repurposing.',
  'Keep replies actionable.',
  'For every successful reply, start with a clean copy-ready snippet that the user can paste directly into X/Twitter, a calendar, notes, or their workflow.',
  'Put only that snippet between these exact markers on separate lines: ---COPY_SNIPPET_START--- and ---COPY_SNIPPET_END---.',
  'After the snippet, add a short Explanation section with helpful notes.',
  'Do not put markdown code fences around the copy snippet.',
].join(' ');

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
}

function trialSecret() {
  return (
    process.env.XSCHEDULAR_TRIAL_SECRET ||
    process.env.JWT_SECRET ||
    process.env.GROQ_API_KEY ||
    'tweetqueue-local-trial-secret'
  );
}

function freshTrialState(): TrialState {
  return {
    count: 0,
    resetAt: Date.now() + TRIAL_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  };
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', trialSecret()).update(payload).digest('base64url');
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function encodeTrialState(state: TrialState) {
  const payload = Buffer.from(JSON.stringify(state)).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
}

function readTrialState(request: NextRequest) {
  const value = request.cookies.get(TRIAL_COOKIE)?.value;
  if (!value) return freshTrialState();

  const [payload, signature] = value.split('.');
  if (!payload || !signature || !timingSafeEqual(signature, signPayload(payload))) {
    return freshTrialState();
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TrialState;
    if (!Number.isFinite(parsed.count) || !Number.isFinite(parsed.resetAt)) {
      return freshTrialState();
    }

    if (parsed.resetAt < Date.now()) {
      return freshTrialState();
    }

    return {
      count: Math.max(0, Math.min(parsed.count, TRIAL_LIMIT)),
      resetAt: parsed.resetAt,
    };
  } catch {
    return freshTrialState();
  }
}

function trialInfo(state: TrialState) {
  return {
    limit: TRIAL_LIMIT,
    used: Math.min(state.count, TRIAL_LIMIT),
    remaining: Math.max(TRIAL_LIMIT - state.count, 0),
    resetAt: new Date(state.resetAt).toISOString(),
  };
}

function setTrialCookie(response: NextResponse, state: TrialState) {
  response.cookies.set(TRIAL_COOKIE, encodeTrialState(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TRIAL_WINDOW_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

async function hasVerifiedSession(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${backendBaseUrl()}/api/auth/me`, {
      headers: { Authorization: authHeader },
      signal: controller.signal,
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const trial = readTrialState(request);

  return NextResponse.json({
    configured: Boolean(process.env.GROQ_API_KEY),
    model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
    trial: trialInfo(trial),
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'xschedular is not configured. Set GROQ_API_KEY in Vercel.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const safeMessages = messages
      .filter(
        (message) =>
          ['user', 'assistant'].includes(message?.role) &&
          typeof message.content === 'string' &&
          message.content.trim()
      )
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 4000),
      }));

    if (safeMessages.length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const authenticated = await hasVerifiedSession(request.headers.get('authorization'));
    const currentTrial = readTrialState(request);

    if (!authenticated && currentTrial.count >= TRIAL_LIMIT) {
      return NextResponse.json(
        {
          error: 'Your free xschedular trial is finished. Sign in to TweetQueue for unlimited prompts.',
          requiresLogin: true,
          trial: trialInfo(currentTrial),
        },
        { status: 429 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: XSCHEDULAR_SYSTEM_PROMPT,
            },
            ...safeMessages,
          ],
          temperature: 0.7,
          max_completion_tokens: 800,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return NextResponse.json(
          {
            error:
              data?.error?.message ||
              `Groq request failed with status ${response.status}. Check GROQ_API_KEY, GROQ_MODEL, and model permissions.`,
          },
          { status: response.status }
        );
      }

      if (authenticated) {
        return NextResponse.json({
          reply: data?.choices?.[0]?.message?.content || 'I could not generate a response.',
          model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
          access: 'unlimited',
        });
      }

      const updatedTrial = {
        ...currentTrial,
        count: Math.min(currentTrial.count + 1, TRIAL_LIMIT),
      };
      const successResponse = NextResponse.json({
        reply: data?.choices?.[0]?.message?.content || 'I could not generate a response.',
        model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        access: 'trial',
        trial: trialInfo(updatedTrial),
      });
      setTrialCookie(successResponse, updatedTrial);

      return successResponse;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'xschedular request timed out. Please try a shorter prompt.'
        : error instanceof Error
          ? error.message
          : 'xschedular request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
