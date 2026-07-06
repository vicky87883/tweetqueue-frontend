'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
  WandSparkles,
  X,
} from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';
import { clearSession, getSession, type SessionUser } from '@/lib/session';
import { aspectRatioClass } from '@/lib/tweet-image';

type ScheduledPost = {
  id: string;
  text: string;
  scheduledAt: string;
  status: string;
  error?: string | null;
  xPostId?: string | null;
  hasMedia?: boolean;
  mediaPreview?: string | null;
  mediaMimeType?: string | null;
  mediaAspectRatio?: '16:9' | '1:1' | null;
};

type XStatus = {
  connected: boolean;
  account?: {
    username: string;
    name?: string | null;
    profileImageUrl?: string | null;
  } | null;
};

const statusCopy: Record<string, string> = {
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Needs retry',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [xStatus, setXStatus] = useState<XStatus | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    setUser(session.user);
    setSessionReady(true);

    Promise.all([
      apiFetch<XStatus>('/api/x/status', {
        headers: { Authorization: `Bearer ${session.token}` },
      }),
      apiFetch<{ success: boolean; posts: ScheduledPost[] }>('/api/scheduled-posts', {
        headers: { Authorization: `Bearer ${session.token}` },
      }),
    ])
      .then(([status, queue]) => {
        setXStatus(status);
        setPosts(queue.posts || []);
      })
      .catch((error) => {
        setMessage(error instanceof ApiError ? error.message : 'Could not load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const stats = useMemo(() => {
    const scheduled = posts.filter((post) => post.status === 'scheduled').length;
    const published = posts.filter((post) => post.status === 'published').length;
    const failed = posts.filter((post) => post.status === 'failed').length;
    const nextPost = posts
      .filter((post) => post.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

    return [
      { label: 'X account', value: xStatus?.connected ? 'Connected' : 'Not connected', detail: xStatus?.account?.username ? `@${xStatus.account.username}` : 'connect before posting' },
      { label: 'Scheduled', value: String(scheduled), detail: 'waiting for publish time' },
      { label: 'Published', value: String(published), detail: 'sent through X API' },
      { label: 'Needs attention', value: String(failed), detail: failed ? 'retry after fixing credits' : 'queue is clean' },
      { label: 'Next post', value: nextPost ? new Date(nextPost.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—', detail: nextPost ? new Date(nextPost.scheduledAt).toLocaleDateString() : 'no upcoming post' },
    ];
  }, [posts, xStatus]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  if (!sessionReady) {
    return <main className="flex min-h-dvh items-center justify-center bg-black text-white">Loading...</main>;
  }

  return (
    <main className="min-h-dvh bg-black text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] border-r border-gray-800 bg-black p-4 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-3xl font-black">𝕏</div>
            <div className="text-xl font-bold">TweetQueue</div>
            <div className="text-xs text-gray-500">production console</div>
          </div>
          <button type="button" className="rounded-xl p-2 text-gray-400 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-2xl bg-[#1DA1F2] px-4 py-3 font-bold text-black">
            <BarChart3 className="h-5 w-5" /> Dashboard
          </button>
          <button
            type="button"
            onClick={() => router.push('/scheduler')}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#1DA1F2]/40 px-4 py-3 font-semibold text-white hover:bg-zinc-900"
          >
            <CalendarClock className="h-5 w-5 text-[#1DA1F2]" /> X Scheduler
          </button>
          <button
            type="button"
            onClick={() => router.push('/scheduler')}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-gray-300 hover:bg-zinc-900"
          >
            <WandSparkles className="h-5 w-5" /> AI Draft Studio
          </button>
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-gray-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user?.name || 'Creator'}</div>
              <div className="text-xs text-emerald-400">Secure session</div>
            </div>
            <button type="button" onClick={handleLogout} className="text-gray-500 hover:text-red-400" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <section className="min-h-dvh lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-gray-800 p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>
                <p className="text-xs text-gray-500">Monitor queue, account status, and scheduled publishing.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/scheduler')}
              className="hidden items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-gray-200 sm:inline-flex"
            >
              Open X Scheduler <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24 sm:px-6 lg:px-8">
          {message && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}

          <section className="rounded-[2rem] border border-gray-800 bg-zinc-950 p-5 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                  <ShieldCheck className="h-4 w-4" /> Production ready
                </div>
                <h2 className="text-balance text-4xl font-black leading-tight sm:text-6xl">
                  Schedule, generate, and publish X posts safely.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
                  Your X account connection and scheduler are live. Use the dedicated scheduler to write posts, generate AI-assisted drafts, set future times, and retry failed posts without touching credentials.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push('/scheduler')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1DA1F2] px-6 py-4 font-bold text-black hover:bg-sky-400"
                  >
                    <CalendarClock className="h-5 w-5" /> Open X Scheduler
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/scheduler')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-700 px-6 py-4 font-bold text-white hover:border-[#1DA1F2]"
                  >
                    <Sparkles className="h-5 w-5" /> Generate with AI
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-800 bg-black p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Live queue</h3>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    {loading ? 'Syncing' : 'Synced'}
                  </span>
                </div>
                <div className="space-y-3">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="rounded-2xl border border-gray-800 bg-zinc-950 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500">{new Date(post.scheduledAt).toLocaleString()}</span>
                        <span className="rounded-full bg-zinc-900 px-3 py-1 text-[#1DA1F2]">{statusCopy[post.status] || post.status}</span>
                      </div>
                      {post.text && <p className="line-clamp-2 text-sm text-gray-300">{post.text}</p>}
                      {post.mediaPreview && (
                        <div
                          className={`${post.text ? 'mt-3' : ''} overflow-hidden rounded-xl border border-gray-800 ${aspectRatioClass(post.mediaAspectRatio || '16:9')}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`data:${post.mediaMimeType || 'image/jpeg'};base64,${post.mediaPreview}`}
                            alt="Scheduled post image"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {!posts.length && <p className="rounded-2xl border border-dashed border-gray-800 p-4 text-sm text-gray-500">No scheduled posts yet. Create your first post from X Scheduler.</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-gray-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between gap-2 text-sm text-gray-500">
                  <span>{stat.label}</span>
                  <CheckCircle2 className="h-4 w-4 text-[#1DA1F2]" />
                </div>
                <div className="mt-2 text-2xl font-black">{stat.value}</div>
                <div className="mt-1 text-xs text-gray-500">{stat.detail}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            {[
              { title: 'Secure OAuth', detail: 'Users connect X through authorization. The app never asks for X passwords.' },
              { title: 'Encrypted tokens', detail: 'Backend stores OAuth tokens encrypted and uses refresh tokens for scheduled posts.' },
              { title: 'Retry-friendly queue', detail: 'Failed posts remain visible so users can retry after API credits or permissions are fixed.' },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border border-gray-800 bg-zinc-950 p-6">
                <ShieldCheck className="mb-4 h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{card.detail}</p>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
