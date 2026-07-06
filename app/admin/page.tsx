'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, CalendarClock, CheckCircle2, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getSession, type SessionUser } from '@/lib/session';

type ScheduledPost = {
  id: string;
  text: string;
  scheduledAt: string;
  status: string;
  error?: string | null;
};

type XStatus = {
  connected: boolean;
  account?: { username: string; name?: string | null } | null;
};

type HealthStatus = {
  status: string;
  database?: boolean;
  scheduler?: boolean;
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Failed',
};

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [xStatus, setXStatus] = useState<XStatus | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const counts = useMemo(() => ({
    total: posts.length,
    scheduled: posts.filter((post) => post.status === 'scheduled').length,
    published: posts.filter((post) => post.status === 'published').length,
    failed: posts.filter((post) => post.status === 'failed').length,
  }), [posts]);

  async function loadData(token: string) {
    setLoading(true);
    setError('');
    try {
      const [healthData, xData, queueData] = await Promise.all([
        apiFetch<HealthStatus>('/api/health'),
        apiFetch<XStatus>('/api/x/status', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch<{ posts: ScheduledPost[] }>('/api/scheduled-posts', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setHealth(healthData);
      setXStatus(xData);
      setPosts(queueData.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setUser(session.user);
    loadData(session.token);
  }, []);

  if (!user) {
    return <main className="flex min-h-dvh items-center justify-center bg-black text-white">Loading admin...</main>;
  }

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const session = getSession();
              if (session?.token) loadData(session.token);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-5 py-3 text-sm font-bold hover:border-[#1DA1F2] disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <section className="rounded-[2rem] border border-gray-800 bg-zinc-950 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
              </div>
              <h1 className="text-balance text-4xl font-black sm:text-6xl">TweetQueue control center</h1>
              <p className="mt-4 max-w-3xl text-gray-400">
                Monitor backend health, your connected X account, scheduler queue, failed posts, and production readiness.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-black p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900">
                  <User className="h-6 w-6 text-[#1DA1F2]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">{user.name}</div>
                  <div className="truncate text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Backend', value: health?.status || 'unknown', detail: health?.database ? 'database connected' : 'database not confirmed', icon: Activity },
            { label: 'Scheduler', value: health?.scheduler ? 'active' : 'unknown', detail: 'worker checks queue every minute', icon: CalendarClock },
            { label: 'X Account', value: xStatus?.connected ? 'connected' : 'not connected', detail: xStatus?.account?.username ? `@${xStatus.account.username}` : 'connect in scheduler', icon: CheckCircle2 },
            { label: 'Failed posts', value: String(counts.failed), detail: counts.failed ? 'check API credits/errors' : 'no failures in current queue', icon: ShieldCheck },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-gray-800 bg-zinc-950 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                <span>{item.label}</span>
                <item.icon className="h-5 w-5 text-[#1DA1F2]" />
              </div>
              <div className="text-2xl font-black capitalize">{item.value}</div>
              <div className="mt-1 text-xs text-gray-500">{item.detail}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-5 sm:p-6">
            <h2 className="text-2xl font-bold">Queue summary</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ['Total', counts.total],
                ['Scheduled', counts.scheduled],
                ['Published', counts.published],
                ['Failed', counts.failed],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-gray-800 bg-black p-4">
                  <div className="text-sm text-gray-500">{label}</div>
                  <div className="mt-1 text-3xl font-black">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-5 sm:p-6">
            <h2 className="text-2xl font-bold">Recent queue activity</h2>
            <div className="mt-5 space-y-3">
              {posts.length === 0 && <p className="rounded-2xl border border-dashed border-gray-800 p-4 text-gray-500">No scheduled posts found.</p>}
              {posts.slice(0, 8).map((post) => (
                <div key={post.id} className="rounded-2xl border border-gray-800 bg-black p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>{new Date(post.scheduledAt).toLocaleString()}</span>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-[#1DA1F2]">{statusLabels[post.status] || post.status}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-300">{post.text}</p>
                  {post.error && <p className="mt-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">{post.error}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
