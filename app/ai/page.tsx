'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { CopyableAiResponse } from '@/components/copyable-ai-response';
import { XschedularMark } from '@/components/xschedular-mark';
import { getSession } from '@/lib/session';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AiStatus = {
  configured: boolean;
  model: string;
  trial?: TrialInfo;
};

type TrialInfo = {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
};

type AiResponse = {
  reply?: string;
  error?: string;
  requiresLogin?: boolean;
  trial?: TrialInfo;
};

const quickPrompts = [
  'Create 7 X post ideas for my SaaS launch',
  'Rewrite this post with a stronger hook',
  'Plan a 28-post weekly content calendar',
  'Give me 5 analytics questions to review',
];

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi, I'm xschedular. I can help plan X posts, improve hooks, organize content batches, and review your publishing strategy.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [statusError, setStatusError] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const controller = new AbortController();
    const sessionTimer = window.setTimeout(() => {
      setSignedIn(Boolean(getSession()));
    }, 0);

    fetch('/api/ai', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatusError('xschedular status unavailable'));

    return () => {
      window.clearTimeout(sessionTimer);
      controller.abort();
    };
  }, []);

  const sendMessage = async (prompt?: string) => {
    const userMessage = (prompt || input).trim();
    if (!userMessage || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    const session = getSession();
    setSignedIn(Boolean(session));
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (session?.token) {
        headers.set('Authorization', `Bearer ${session.token}`);
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const data = (await res.json().catch(() => null)) as AiResponse | null;
      if (data?.trial) {
        setStatus((current) =>
          current ? { ...current, trial: data.trial } : { configured: true, model: '', trial: data.trial }
        );
      }

      const reply = res.ok
        ? data?.reply || "Sorry, I couldn't process that."
        : data?.error || "Sorry, I couldn't process that.";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'xschedular is unavailable right now. Please try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-black text-white">
      <div className="flex min-w-0 flex-1 flex-col">
      <header className="app-top-glass z-30 border-b border-gray-800 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <XschedularMark />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-3xl">xschedular</h1>
              <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500 sm:text-sm">
                <span className="truncate">
                  {status?.model || statusError || 'Checking Groq status...'}
                </span>
                {status?.configured && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white sm:w-auto sm:px-4"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-6">
        {status?.configured === false && (
          <div className="mb-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            xschedular is not configured for this environment. Set <span className="font-mono">GROQ_API_KEY</span>
            {status?.model ? ` and verify model ${status.model}.` : ' in Vercel.'}
          </div>
        )}

        {statusError && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {statusError}. Refresh the page after checking environment variables.
          </div>
        )}

        <div className="mb-3 flex flex-col gap-2 rounded-3xl border border-gray-800 bg-zinc-950 px-4 py-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {signedIn ? (
              <span>
                <span className="font-semibold text-[#1DA1F2]">Unlimited mode:</span> signed-in
                TweetQueue users can use xschedular without the public trial cap.
              </span>
            ) : (
              <span>
                <span className="font-semibold text-[#1DA1F2]">Free trial:</span>{' '}
                {status?.trial
                  ? `${status.trial.remaining} of ${status.trial.limit} prompts left.`
                  : '4 prompts available.'}
              </span>
            )}
          </div>
          {!signedIn && (
            <Link href="/login" className="shrink-0 rounded-full bg-[#1DA1F2] px-4 py-2 text-center text-xs font-bold text-black">
              Sign in for unlimited
            </Link>
          )}
        </div>

        <section className="hide-scrollbar mb-3 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="min-w-[13rem] rounded-3xl border border-gray-800 bg-zinc-950 p-4 text-left text-sm text-gray-300 transition hover:border-[#1DA1F2] hover:text-white disabled:opacity-60 sm:min-w-0"
            >
              <Sparkles className="mb-3 h-4 w-4 text-[#1DA1F2]" />
              {prompt}
            </button>
          ))}
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto rounded-[1.75rem] border border-gray-800 bg-zinc-950/70 p-3 sm:rounded-3xl sm:p-5">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-[#1DA1F2] text-black'
                    : 'border border-gray-800 bg-black'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <CopyableAiResponse content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
                <RefreshCw className="h-4 w-4 animate-spin text-[#1DA1F2]" />
                Thinking
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>
      </main>

      <form
        className="border-t border-gray-800 bg-black p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <div className="mx-auto flex max-w-5xl items-end gap-2 sm:gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask for hooks, weekly plans, rewrite ideas..."
            className="max-h-36 min-h-12 flex-1 resize-none rounded-3xl border border-gray-700 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-[#1DA1F2]"
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1DA1F2] text-black transition hover:bg-[#1a8cd8] disabled:opacity-50 sm:w-16 sm:rounded-3xl"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-center text-[10px] text-gray-600 sm:text-xs">
          Server-side Groq integration. Your API key stays off the browser.
        </p>
      </form>
      </div>
    </div>
  );
}
