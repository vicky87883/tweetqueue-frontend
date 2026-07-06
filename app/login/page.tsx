'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { ApiError, apiFetch } from '@/lib/api';
import { saveSession, type SessionUser } from '@/lib/session';

type AuthResponse = {
  success: boolean;
  token: string;
  user: SessionUser;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (data.success && data.token && data.user) {
        saveSession({ token: data.token, user: data.user });
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Sign in failed. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-safe-page flex items-center justify-center bg-black px-4 text-white sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-gray-800 bg-zinc-950 p-5 shadow-2xl shadow-black/40 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="mb-8 text-center sm:mb-10">
          <Link href="/" className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-800 bg-black text-5xl sm:mb-6 sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:text-6xl">
            𝕏
          </Link>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">
            Sign in to TweetQueue
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base">
            Access your production queue and settings
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-400" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-12 rounded-2xl border border-gray-700 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-[#1DA1F2] sm:px-6 sm:py-4 sm:text-lg"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-12 rounded-2xl border border-gray-700 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-[#1DA1F2] sm:px-6 sm:py-4 sm:text-lg"
              required
              autoComplete="current-password"
            />
          </div>

          {loading && (
            <div className="rounded-2xl border border-[#1DA1F2]/30 bg-[#1DA1F2]/10 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#1DA1F2]">
                <span>Signing in</span>
                <span className="animate-pulse text-gray-300">Please wait</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full w-3/4 rounded-full bg-[#1DA1F2] transition-all duration-700" />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 sm:text-base">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-14 w-full rounded-3xl bg-[#1DA1F2] py-3.5 text-lg font-bold text-black transition hover:bg-[#1a8cd8] disabled:opacity-60 sm:py-4 sm:text-xl"
          >
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 sm:mt-8 sm:text-base">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#1DA1F2] hover:underline">
            Create one
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-gray-600">
          Admin access?{' '}
          <Link href="/admin/login" className="font-medium text-gray-400 hover:text-[#1DA1F2]">
            Open admin console
          </Link>
        </p>
      </div>
      <MobileAppDock />
    </div>
  );
}
