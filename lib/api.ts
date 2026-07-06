/** Browser-facing API base. External backends are proxied by Next to avoid CORS issues. */
const configuredApiBase =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL?.trim() : undefined;

const DEFAULT_API_TIMEOUT_MS = 30000;

function normalizeApiBase(base?: string) {
  const normalized = base?.replace(/\/+$/, '');

  if (!normalized || /^https?:\/\//i.test(normalized)) {
    return '/api/backend';
  }

  return normalized;
}

export const API_BASE = normalizeApiBase(configuredApiBase);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export function assertApiConfigured() {
  if (!API_BASE) {
    throw new ApiError(
      'Production API URL is not configured. Set BACKEND_API_URL in Vercel.',
      0
    );
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertApiConfigured();

  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      headers,
      cache: 'no-store',
      signal: init.signal || controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === 'object'
          ? String(
              ('error' in data && data.error) ||
                ('message' in data && data.message) ||
                'Request failed'
            )
          : 'Request failed';

      throw new ApiError(errorMessage, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request is taking too long. Please try again.', 408);
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
