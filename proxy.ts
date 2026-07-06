import { NextRequest, NextResponse } from 'next/server';

const XSCHEDULAR_HOSTS = new Set([
  'xschedular.tweetqueue.com',
  process.env.XSCHEDULAR_HOST?.toLowerCase(),
].filter(Boolean));

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();

  if (host && XSCHEDULAR_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = '/ai';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
