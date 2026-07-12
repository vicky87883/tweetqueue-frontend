'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthProgress } from '@/components/auth-progress';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { ApiError, apiFetch } from '@/lib/api';

type RegisterResponse = {
  success: boolean;
  verificationRequired?: boolean;
  message?: string;
};

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await apiFetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (data.success) {
        setSuccessMessage(
          data.message ||
            'Account created. Please check your inbox and verify your email before signing in.'
        );
        setPassword('');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Registration failed. Please check your connection and try again.'
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
            Create TweetQueue account
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base">
            Verify your email to activate your secure X queue workspace.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-400" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Vikram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-12 rounded-2xl border border-gray-700 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-[#1DA1F2] sm:px-6 sm:py-4 sm:text-lg"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-12 rounded-2xl border border-gray-700 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-[#1DA1F2] sm:px-6 sm:py-4 sm:text-lg"
              required
              autoComplete="new-password"
            />
          </div>

          {loading && <AuthProgress label="Creating account" />}

          {successMessage && (
            <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200 sm:text-base">
              {successMessage}
            </p>
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
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 sm:mt-8 sm:text-base">
          Already verified?{' '}
          <Link href="/login" className="font-medium text-[#1DA1F2] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <MobileAppDock />
    </div>
  );
}
