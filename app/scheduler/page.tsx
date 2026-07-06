'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  ImagePlus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';
import { getSession } from '@/lib/session';
import {
  aspectRatioClass,
  prepareTweetImage,
  TWEET_ASPECT_RATIOS,
  type PreparedTweetImage,
  type TweetAspectRatio,
} from '@/lib/tweet-image';

type XAccount = {
  username: string;
  name?: string | null;
  profileImageUrl?: string | null;
};

type XStatus = {
  connected: boolean;
  account?: XAccount | null;
};

type ScheduledPost = {
  id: string;
  text: string;
  scheduledAt: string;
  status: string;
  xPostId?: string | null;
  error?: string | null;
  hasMedia?: boolean;
  mediaPreview?: string | null;
  mediaMimeType?: string | null;
  mediaAspectRatio?: TweetAspectRatio | null;
};

type ScheduledPostsResponse = {
  success: boolean;
  posts: ScheduledPost[];
};

const statusStyles: Record<string, string> = {
  scheduled: 'bg-[#1DA1F2]/10 text-[#1DA1F2]',
  publishing: 'bg-amber-500/10 text-amber-300',
  published: 'bg-emerald-500/10 text-emerald-300',
  failed: 'bg-red-500/10 text-red-300',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Failed',
};

const tones = ['Helpful', 'Founder', 'Launch', 'Educational'];

function cleanTweet(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 280);
}

function generateDraft(topic: string, tone: string) {
  const idea = topic.trim() || 'building consistent X content';
  const templates: Record<string, string> = {
    Helpful: `Most creators do not need more random posting. They need a simple system: capture ideas, turn them into clear posts, schedule them, then review what worked. That is exactly why I built TweetQueue for ${idea}.`,
    Founder: `I used to think consistency on X was about motivation. It is not. It is about having a queue ready before the week gets busy. Building TweetQueue is my attempt to make ${idea} easier and less stressful.`,
    Launch: `New workflow inside TweetQueue: write once, schedule ahead, and keep your X account active without rushing every day. If ${idea} is part of your growth plan, a clean queue changes everything.`,
    Educational: `A simple X scheduling workflow for ${idea}: 1) collect raw ideas, 2) improve the hook, 3) schedule in useful time windows, 4) review failed or published posts, 5) repeat weekly.`,
  };
  return cleanTweet(templates[tone] || templates.Helpful);
}

function getDefaultFutureTime() {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
}

export default function SchedulerPage() {
  const [status, setStatus] = useState<XStatus | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [text, setText] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [loading, setLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Helpful');
  const [imageAspectRatio, setImageAspectRatio] = useState<TweetAspectRatio>('16:9');
  const [selectedImage, setSelectedImage] = useState<PreparedTweetImage | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  const session = typeof window !== 'undefined' ? getSession() : null;

  const queueStats = useMemo(() => ({
    scheduled: posts.filter((post) => post.status === 'scheduled').length,
    published: posts.filter((post) => post.status === 'published').length,
    failed: posts.filter((post) => post.status === 'failed').length,
  }), [posts]);

  function showMessage(type: 'info' | 'success' | 'error', value: string) {
    setMessageType(type);
    setMessage(value);
  }

  async function loadData() {
    if (!session?.token) {
      window.location.href = '/login';
      return;
    }

    try {
      const [xStatus, queue] = await Promise.all([
        apiFetch<XStatus>('/api/x/status', {
          headers: { Authorization: `Bearer ${session.token}` },
        }),
        apiFetch<ScheduledPostsResponse>('/api/scheduled-posts', {
          headers: { Authorization: `Bearer ${session.token}` },
        }),
      ]);
      setStatus(xStatus);
      setPosts(queue.posts || []);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not load scheduler data.');
    }
  }

  useEffect(() => {
    setScheduledAt(getDefaultFutureTime());
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectX() {
    if (!session?.token) return;
    setLoading(true);
    setMessage('');

    try {
      const data = await apiFetch<{ authUrl: string }>('/api/x/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      window.location.href = data.authUrl;
    } catch (error) {
      showMessage('error', error instanceof ApiError ? error.message : 'Could not start X login.');
      setLoading(false);
    }
  }

  function generateWithAi() {
    const draft = generateDraft(aiTopic, aiTone);
    setText(draft);
    showMessage('success', 'AI draft generated. Review it once before scheduling.');
  }

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageProcessing(true);
    setMessage('');

    try {
      const prepared = await prepareTweetImage(file, imageAspectRatio);
      setSelectedImage(prepared);
      showMessage('success', `Image cropped to ${imageAspectRatio} for X.`);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not prepare image.');
    } finally {
      setImageProcessing(false);
    }
  }

  async function handleAspectRatioChange(nextRatio: TweetAspectRatio) {
    setImageAspectRatio(nextRatio);
    if (!selectedImage) return;

    setImageProcessing(true);
    setMessage('');

    try {
      const response = await fetch(selectedImage.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tweet-image.jpg', { type: 'image/jpeg' });
      const prepared = await prepareTweetImage(file, nextRatio);
      setSelectedImage(prepared);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not update aspect ratio.');
    } finally {
      setImageProcessing(false);
    }
  }

  function clearSelectedImage() {
    setSelectedImage(null);
  }

  async function schedulePost() {
    if (!session?.token) return;
    setLoading(true);
    setMessage('');

    try {
      await apiFetch('/api/scheduled-posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          text,
          scheduledAt: new Date(scheduledAt).toISOString(),
          ...(selectedImage
            ? {
                mediaData: selectedImage.base64,
                mediaPreview: selectedImage.previewBase64,
                mediaMimeType: selectedImage.mimeType,
                mediaAspectRatio: selectedImage.aspectRatio,
              }
            : {}),
        }),
      });
      setText('');
      setSelectedImage(null);
      setScheduledAt(getDefaultFutureTime());
      showMessage('success', 'Post scheduled successfully. It will publish automatically at the selected time.');
      await loadData();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not schedule post.');
    } finally {
      setLoading(false);
    }
  }

  async function publishNow(id: string) {
    if (!session?.token) return;
    setLoading(true);
    setMessage('');

    try {
      const response = await apiFetch<{ success: boolean; result?: { status: string }; post?: ScheduledPost }>(`/api/scheduled-posts/${id}/publish-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      await loadData();
      if (response.success && response.result?.status === 'published') {
        showMessage('success', 'Post published successfully.');
      } else {
        showMessage('error', response.post?.error || 'Post failed. Check the queue message and retry after fixing the issue.');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not publish post.');
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!session?.token) return;
    setLoading(true);
    try {
      await apiFetch(`/api/scheduled-posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      });
      showMessage('success', 'Post removed from queue.');
      await loadData();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Could not remove post.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <section className="mb-6 overflow-hidden rounded-[2rem] border border-gray-800 bg-zinc-950 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <CalendarClock className="h-4 w-4" /> X Scheduler
              </div>
              <h1 className="text-balance text-4xl font-black leading-tight sm:text-6xl">Plan posts without overthinking.</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">
                Connect your X account once, generate or write a post, choose a future time, and let TweetQueue publish it securely through your own authorization.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-black p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Account status</div>
                  <div className="mt-1 text-2xl font-bold">
                    {status?.connected ? `@${status.account?.username}` : 'Not connected'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={connectX}
                  disabled={loading || status?.connected}
                  className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
                >
                  {status?.connected ? 'Connected' : 'Connect X'}
                </button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-zinc-950 p-3"><div className="text-xl font-bold">{queueStats.scheduled}</div><div className="text-gray-500">Scheduled</div></div>
                <div className="rounded-2xl bg-zinc-950 p-3"><div className="text-xl font-bold">{queueStats.published}</div><div className="text-gray-500">Published</div></div>
                <div className="rounded-2xl bg-zinc-950 p-3"><div className="text-xl font-bold">{queueStats.failed}</div><div className="text-gray-500">Retry</div></div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className={`mb-5 rounded-2xl border p-4 text-sm ${messageType === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-200' : messageType === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-[#1DA1F2]/30 bg-[#1DA1F2]/10 text-[#1DA1F2]'}`}>
            {message}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <WandSparkles className="h-5 w-5 text-[#1DA1F2]" />
                <h2 className="text-2xl font-bold">AI draft helper</h2>
              </div>
              <p className="text-sm text-gray-500">Generate a clean first draft, then edit it manually before scheduling.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={aiTopic}
                  onChange={(event) => setAiTopic(event.target.value)}
                  placeholder="Topic or idea, e.g. AI scheduling for creators"
                  className="rounded-2xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-[#1DA1F2]"
                />
                <select
                  value={aiTone}
                  onChange={(event) => setAiTone(event.target.value)}
                  className="rounded-2xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-[#1DA1F2]"
                >
                  {tones.map((tone) => <option key={tone}>{tone}</option>)}
                </select>
              </div>
              <button type="button" onClick={generateWithAi} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#1DA1F2]/40 px-5 py-3 text-sm font-bold hover:bg-[#1DA1F2]/10">
                <Sparkles className="h-4 w-4" /> Generate draft
              </button>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-5 sm:p-6">
              <h2 className="text-2xl font-bold">Create scheduled post</h2>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={280}
                placeholder="What's happening?"
                className="mt-4 min-h-44 w-full resize-none rounded-2xl border border-gray-700 bg-black p-4 leading-relaxed outline-none focus:border-[#1DA1F2]"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Review before publishing. Avoid spam, repeated content, or misleading claims.</span>
                <span>{text.length}/280</span>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-800 bg-black p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Add image</div>
                    <div className="text-xs text-gray-500">Crop to X feed aspect ratio before scheduling.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(Object.keys(TWEET_ASPECT_RATIOS) as TweetAspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => handleAspectRatioChange(ratio)}
                        disabled={imageProcessing}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          imageAspectRatio === ratio
                            ? 'bg-[#1DA1F2] text-black'
                            : 'border border-gray-700 text-gray-300 hover:border-[#1DA1F2]'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-700 px-4 py-3 text-sm font-bold text-gray-200 hover:border-[#1DA1F2]">
                    <ImagePlus className="h-4 w-4 text-[#1DA1F2]" />
                    {imageProcessing ? 'Processing...' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={imageProcessing || loading}
                      onChange={handleImageSelect}
                    />
                  </label>
                  <span className="text-xs text-gray-500">
                    {TWEET_ASPECT_RATIOS[imageAspectRatio].description}
                  </span>
                </div>

                {selectedImage && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800 bg-zinc-950">
                    <div
                      className={`relative w-full overflow-hidden bg-zinc-900 ${aspectRatioClass(selectedImage.aspectRatio)}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedImage.previewDataUrl}
                        alt="Scheduled post preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white hover:bg-black"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-gray-500">
                      <span>
                        {selectedImage.width} x {selectedImage.height}px · {selectedImage.aspectRatio}
                      </span>
                      <span>JPEG · ready for X</span>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="mt-4 w-full rounded-2xl border border-gray-700 bg-black p-4 outline-none focus:border-[#1DA1F2]"
              />
              <button
                type="button"
                onClick={schedulePost}
                disabled={loading || (!text.trim() && !selectedImage) || !scheduledAt || !status?.connected || imageProcessing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-[#1DA1F2] px-6 py-4 font-bold text-black disabled:opacity-60"
              >
                <Send className="h-5 w-5" /> Schedule post
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Queue</h2>
                <p className="mt-1 text-sm text-gray-500">Scheduled, published, and retryable posts.</p>
              </div>
              <button type="button" onClick={loadData} className="rounded-2xl border border-gray-700 p-3 hover:border-[#1DA1F2]" aria-label="Refresh queue">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {posts.length === 0 && <p className="rounded-2xl border border-dashed border-gray-800 p-4 text-gray-500">No scheduled posts yet.</p>}
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-gray-800 bg-black p-4">
                  {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{post.text}</p>}
                  {post.mediaPreview && (
                    <div
                      className={`${post.text ? 'mt-3' : ''} overflow-hidden rounded-2xl border border-gray-800 bg-zinc-950 ${aspectRatioClass(post.mediaAspectRatio || '16:9')}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${post.mediaMimeType || 'image/jpeg'};base64,${post.mediaPreview}`}
                        alt="Scheduled post image"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {!post.text && post.hasMedia && !post.mediaPreview && (
                    <p className="text-sm text-gray-400">Image post</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(post.scheduledAt).toLocaleString()}</span>
                    <span className={`rounded-full px-3 py-1 ${statusStyles[post.status] || 'bg-zinc-900 text-gray-300'}`}>{statusLabels[post.status] || post.status}</span>
                  </div>
                  {post.error && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs leading-relaxed text-red-200">{post.error}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.status !== 'published' && (
                      <button type="button" onClick={() => publishNow(post.id)} disabled={loading} className="rounded-full border border-gray-700 px-4 py-2 text-xs font-bold hover:border-[#1DA1F2]">
                        Publish now
                      </button>
                    )}
                    {post.status !== 'published' && post.status !== 'publishing' && (
                      <button type="button" onClick={() => deletePost(post.id)} disabled={loading} className="rounded-full border border-gray-700 px-4 py-2 text-xs font-bold text-gray-400 hover:border-red-400 hover:text-red-300">
                        Remove
                      </button>
                    )}
                    <button type="button" onClick={() => navigator.clipboard.writeText(post.text)} className="rounded-full border border-gray-700 px-4 py-2 text-xs font-bold text-gray-400 hover:border-[#1DA1F2]">
                      <Copy className="inline h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
              <div className="mb-1 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" /> Security note</div>
              X tokens stay on the backend and are encrypted. Never ask users for their X password or private API secrets.
              {status?.connected && (
                <p className="mt-2 text-xs text-emerald-100/80">
                  Image posts need the latest X permission. If upload fails, disconnect and reconnect your X account once.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
