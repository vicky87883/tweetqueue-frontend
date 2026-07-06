import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_BACKEND_URL = 'https://tweetqueue-1.onrender.com';

const blockedRequestHeaders = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
]);

const blockedResponseHeaders = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
]);

type ProxyContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

function backendBaseUrl() {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;

  return configured.replace(/\/+$/, '');
}

async function proxyToBackend(request: NextRequest, context: ProxyContext) {
  const params = await context.params;
  const path = params.path?.join('/') || '';
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${backendBaseUrl()}/${path}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  blockedRequestHeaders.forEach((header) => headers.delete(header));

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  });

  const responseHeaders = new Headers(response.headers);
  blockedResponseHeaders.forEach((header) => responseHeaders.delete(header));

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: ProxyContext) {
  return proxyToBackend(request, context);
}

export function POST(request: NextRequest, context: ProxyContext) {
  return proxyToBackend(request, context);
}

export function PUT(request: NextRequest, context: ProxyContext) {
  return proxyToBackend(request, context);
}

export function PATCH(request: NextRequest, context: ProxyContext) {
  return proxyToBackend(request, context);
}

export function DELETE(request: NextRequest, context: ProxyContext) {
  return proxyToBackend(request, context);
}
