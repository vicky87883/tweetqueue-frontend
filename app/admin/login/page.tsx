'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';
import { getAdminSession, saveAdminSession, type SessionUser } from '@/lib/session';

type AdminAuthResponse = {
  success: boolean;
  token: string;
  user: SessionUser;
};

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@tweetqueue.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getAdminSession();
    if (session) router.replace('/admin');
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch<AdminAuthResponse>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.token && data.user) {
        saveAdminSession({ token: data.token, user: data.user });
        router.push('/admin');
      } else {
        setError('Admin login failed.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Admin login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-safe-page flex min-h-dvh items-center justify-center bg-black px-4 py-8 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          TweetQueue
        </Link>

        <div className="mobile-surface rounded-[2rem] p-5 shadow-2xl shadow-[#1DA1F2]/10 sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-[#1DA1F2]/40 bg-[#1DA1F2]/10">
              <ShieldCheck className="h-7 w-7 text-[#1DA1F2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Admin Console</h1>
              <p className="mt-1 text-sm text-gray-500">Private access for user activity.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-400">Admin email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-14 w-full rounded-2xl border border-gray-800 bg-black px-4 text-base outline-none transition focus:border-[#1DA1F2]"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-400">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-14 w-full rounded-2xl border border-gray-800 bg-black px-4 text-base outline-none transition focus:border-[#1DA1F2]"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1DA1F2] px-5 py-4 font-bold text-black transition hover:bg-[#1a8cd8] disabled:opacity-50"
            >
              <LockKeyhole className="h-5 w-5" />
              {loading ? 'Checking access...' : 'Open admin panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
