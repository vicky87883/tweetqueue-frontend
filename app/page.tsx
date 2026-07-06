'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  Layers3,
  LineChart,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { XschedularMark } from '@/components/xschedular-mark';
import { blogPosts } from '@/lib/content';

const workflow = [
  {
    icon: Upload,
    title: 'Capture every idea',
    desc: 'Drop hooks, raw tweets, product notes, launch updates, and thread starters into one focused queue.',
  },
  {
    icon: WandSparkles,
    title: 'Improve with xschedular',
    desc: 'Use AI to sharpen hooks, rewrite weak posts, create thread outlines, and turn messy ideas into X-ready drafts.',
  },
  {
    icon: Calendar,
    title: 'Schedule the week',
    desc: 'Build a balanced publishing calendar with daily cadence, best-time slots, and clear content coverage.',
  },
  {
    icon: BarChart3,
    title: 'Review signals',
    desc: 'Study what works, repeat winning angles, and keep your next batch stronger than the last one.',
  },
];

const metrics = [
  { label: 'Posts planned weekly', value: '28' },
  { label: 'Avg. planning time saved', value: '6h' },
  { label: 'Content angles tracked', value: '12' },
];

const useCases = [
  'Founder-led X growth',
  'Twitter thread planning',
  'SaaS launch content',
  'Agency content calendars',
  'Build-in-public posts',
  'Creator growth systems',
  'Product update queues',
  'Audience research loops',
];

const aiCards = [
  {
    title: 'Hook rewrites',
    desc: 'Turn a flat opening into a sharper first line built for the X feed.',
  },
  {
    title: 'Thread outlines',
    desc: 'Break one idea into a structured Twitter/X thread with a stronger CTA.',
  },
  {
    title: 'Content calendar ideas',
    desc: 'Generate angles for launches, updates, case studies, lessons, and offers.',
  },
];

const contentPillars = [
  {
    icon: Target,
    title: 'Audience intent',
    desc: 'Plan posts around problems your readers already care about: growth, launches, workflows, and proof.',
  },
  {
    icon: MessageCircle,
    title: 'Conversation starters',
    desc: 'Balance educational posts with questions, hot takes, lessons, and founder notes that invite replies.',
  },
  {
    icon: Layers3,
    title: 'Repurposing system',
    desc: 'Turn one product update into tweets, threads, short lessons, launch notes, and weekly recap posts.',
  },
];

const productHighlights = [
  'AI-assisted post ideation',
  'Queue-first dashboard',
  'Mobile app style views',
  'Calendar planning',
  'X credential setup',
  'Admin user tracking',
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const articles = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen overflow-hidden bg-black pb-20 text-white md:pb-0">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-800 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="x-logo shrink-0 text-white">𝕏</div>
            <span className="truncate text-lg font-bold sm:text-2xl">TweetQueue</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#product" className="text-sm text-gray-300 hover:text-white">
              Product
            </a>
            <a href="#ai" className="text-sm text-gray-300 hover:text-white">
              AI
            </a>
            <a href="#workflow" className="text-sm text-gray-300 hover:text-white">
              Workflow
            </a>
            <a href="#analytics" className="text-sm text-gray-300 hover:text-white">
              Analytics
            </a>
            <Link href="/blog" className="text-sm text-gray-300 hover:text-white">
              Blog
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Sign in
            </Link>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-800 text-white md:hidden"
            aria-expanded={navOpen}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {navOpen && (
          <div className="border-t border-gray-800 bg-black px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {[
                ['Product', '#product'],
                ['AI', '#ai'],
                ['Workflow', '#workflow'],
                ['Analytics', '#analytics'],
                ['Blog', '/blog'],
                ['Careers', '/careers'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-xl px-3 py-3 text-center hover:bg-gray-900"
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-full bg-white py-3 text-center text-sm font-semibold text-black"
                onClick={() => setNavOpen(false)}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="hero-grid relative px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-14 mx-auto h-[38rem] max-w-6xl opacity-30 blur-sm">
          <Image
            src="/dashboard-preview.svg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="motion-fade-up mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-gray-800 bg-black/80 px-3 py-1.5 sm:mb-6 sm:px-4">
            <span className="shrink-0 text-emerald-400">●</span>
            <span className="text-xs text-gray-200 sm:text-sm">
              AI-powered X and Twitter scheduling for serious creators
            </span>
          </div>

          <h1 className="motion-fade-up mx-auto mb-5 max-w-5xl text-balance text-4xl font-bold leading-tight sm:mb-6 sm:text-6xl md:text-7xl">
            Build a smarter <span className="text-[#1DA1F2]">X content engine</span> from one
            clean dashboard
          </h1>

          <p className="motion-fade-up-delay mx-auto mb-8 max-w-3xl text-balance text-base leading-relaxed text-gray-300 sm:mb-10 sm:text-xl">
            TweetQueue helps founders, creators, and growth teams plan Twitter/X posts, improve
            hooks with xschedular AI, schedule weekly content, and learn what deserves to be
            repeated.
          </p>

          <div className="motion-fade-up-delay flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/register"
              className="btn-primary flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-base font-semibold transition sm:px-10 sm:py-4 sm:text-lg"
            >
              <Zap className="h-5 w-5 shrink-0" />
              Start Scheduling Free
            </Link>
            <Link
              href="/ai"
              className="flex items-center justify-center gap-2 rounded-full border border-gray-700 bg-black/70 px-6 py-3.5 text-base transition hover:bg-gray-900 sm:px-8 sm:py-4 sm:text-lg"
            >
              Try xschedular
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-gray-800 bg-black/80 p-4">
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="mt-1 text-xs text-gray-500">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="product" className="relative mx-auto mt-12 max-w-6xl sm:mt-16">
          <div className="product-frame motion-float overflow-hidden rounded-3xl">
            <Image
              src="/dashboard-preview.svg"
              alt="TweetQueue dashboard preview with queue, calendar, and analytics"
              width={1440}
              height={920}
              priority
              sizes="(max-width: 768px) 100vw, 1152px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-gray-800 bg-zinc-950 py-4">
        <div className="overflow-hidden">
          <div className="motion-marquee flex w-max gap-3 px-4 text-sm text-gray-400">
            {[...useCases, ...useCases].map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-full border border-gray-800 bg-black px-4 py-2"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="bg-black px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-[#1DA1F2]">
              <WandSparkles className="h-4 w-4" />
              Meet xschedular
            </div>
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">
              AI that helps you write better posts before they hit the queue
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-400 sm:text-lg">
              xschedular is built for X workflows: hooks, threads, posting calendars, creator
              angles, product launches, and content repurposing. It keeps the assistant focused on
              publishing outcomes instead of generic chat.
            </p>

            <div className="mt-7 grid gap-3">
              {aiCards.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl border border-gray-800 bg-zinc-950 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1DA1F2]" />
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mobile-app-screen p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <XschedularMark />
                <div>
                  <div className="font-bold">xschedular</div>
                  <div className="text-xs text-emerald-400">Groq-ready AI assistant</div>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-[#1DA1F2]" />
            </div>

            <div className="space-y-3">
              <div className="max-w-[82%] rounded-3xl border border-gray-800 bg-black p-4 text-sm leading-relaxed text-gray-300">
                Give me 7 X post ideas for a SaaS launch this week.
              </div>
              <div className="ml-auto max-w-[90%] rounded-3xl bg-[#1DA1F2] p-4 text-sm leading-relaxed text-black">
                Start with proof, then show the product shift. I will create launch posts, founder
                notes, one thread, and three reply-friendly questions.
              </div>
              <div className="rounded-3xl border border-gray-800 bg-zinc-950 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="h-4 w-4 text-[#1DA1F2]" />
                  Suggested content mix
                </div>
                <div className="space-y-3">
                  {[
                    ['Launch story', '88%'],
                    ['Founder lesson', '76%'],
                    ['Customer problem', '69%'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-xs text-gray-500">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black">
                        <div className="motion-pulse-line h-full rounded-full bg-[#1DA1F2]" style={{ width: value }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <Sparkles className="h-4 w-4" />
                Creator operating system
              </div>
              <h2 className="text-balance text-3xl font-bold sm:text-5xl">
                From raw ideas to a complete publishing rhythm
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
              The product is shaped around the real loop: collect ideas, improve drafts, schedule
              posts, then use signal to plan the next content sprint.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <div
                key={item.title}
                className="card motion-fade-up rounded-2xl p-6 sm:p-7"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <item.icon className="mb-5 h-9 w-9 text-[#1DA1F2]" />
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-[#1DA1F2]">
              <Target className="h-4 w-4" />
              Twitter/X strategy
            </div>
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">
              More than scheduling: a system for better X content
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-400 sm:text-lg">
              Strong X growth needs more than a publish button. It needs angles, repetition,
              cadence, and a way to turn product moments into posts people actually want to read.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {contentPillars.map((pillar) => (
              <div key={pillar.title} className="card rounded-2xl p-6 sm:p-8">
                <pillar.icon className="mb-5 h-9 w-9 text-[#1DA1F2]" />
                <h3 className="mb-3 text-xl font-semibold">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {productHighlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-zinc-950 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1DA1F2]" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
              <Clock className="h-4 w-4" />
              Scheduling view
            </div>
            <h2 className="mb-5 text-balance text-3xl font-bold sm:text-5xl">
              See the whole week before anything goes live
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-400 sm:text-lg">
              The calendar view helps you spot content gaps, overloaded days, missing launch
              coverage, and the posting windows that deserve your strongest hooks.
            </p>
            <div className="space-y-3">
              {['Balanced posting windows', 'Daily content targets', 'Draft-first workflow'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-200">
                    <CheckCircle2 className="h-5 w-5 text-[#1DA1F2]" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="image-frame overflow-hidden rounded-3xl">
            <Image
              src="/calendar-preview.svg"
              alt="TweetQueue calendar planner preview"
              width={1200}
              height={760}
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section id="analytics" className="bg-black px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="image-frame order-2 overflow-hidden rounded-3xl lg:order-1">
            <Image
              src="/analytics-preview.svg"
              alt="TweetQueue analytics dashboard preview"
              width={1200}
              height={760}
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="h-auto w-full"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-[#1DA1F2]">
              <LineChart className="h-4 w-4" />
              Analytics loop
            </div>
            <h2 className="mb-5 text-balance text-3xl font-bold sm:text-5xl">
              Turn every content batch into better signal
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-400 sm:text-lg">
              Use performance patterns to decide what to repeat: hooks with numbers, launch posts,
              audience questions, product updates, and long-form thread openers.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-gray-800 bg-zinc-950 p-4">
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">
              Built like a production tool, not a local demo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              TweetQueue combines a focused dashboard, mobile-friendly screens, secure backend
              flows, and content education so the product feels trustworthy on day one.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Secure setup',
                desc: 'Auth, admin access, X API credentials, and AI keys live behind backend routes instead of browser-only shortcuts.',
              },
              {
                icon: FileText,
                title: 'SEO content base',
                desc: 'Blog pages teach users how to tweet, plan calendars, improve X posts, and build consistent publishing systems.',
              },
              {
                icon: Sparkles,
                title: 'Polished motion',
                desc: 'Subtle animation, app-like mobile surfaces, and product screenshots make the frontend feel modern and alive.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card rounded-2xl p-6 sm:p-8">
                <feature.icon className="mb-5 h-9 w-9 text-[#1DA1F2]" />
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-sm text-[#1DA1F2]">
                <FileText className="h-4 w-4" />
                X growth guides
              </div>
              <h2 className="text-balance text-3xl font-bold sm:text-5xl">
                Learn the systems behind better X publishing
              </h2>
            </div>
            <Link href="/blog" className="w-fit rounded-full border border-gray-700 px-5 py-3 text-sm hover:bg-gray-900">
              Read all posts
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="card group rounded-2xl p-6 transition hover:border-[#1DA1F2]"
              >
                <div className="mb-5 w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs text-[#1DA1F2]">
                  {article.category}
                </div>
                <h3 className="mb-5 text-xl font-semibold group-hover:text-[#1DA1F2]">
                  {article.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm text-gray-500 group-hover:text-white">
                  Read article
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-gray-800 bg-black p-6 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#1DA1F2] text-black">
            <Zap className="h-7 w-7" />
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold sm:text-5xl">
            Ready to make your X workflow feel calm, sharp, and repeatable?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Create your account, connect the backend, and start building a weekly content engine
            that looks and feels like a real production tool.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-gray-200"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-gray-700 px-8 py-4 text-base hover:bg-gray-900"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 bg-black px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 text-center sm:text-left lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 text-3xl font-black">𝕏 TweetQueue</div>
            <p className="max-w-xl text-gray-400">
              A serious scheduling dashboard for creators who want a calmer, more consistent way
              to publish on X and Twitter.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-end">
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-gray-200"
            >
              Start free
            </Link>
            <Link
              href="/careers"
              className="rounded-full border border-gray-700 px-8 py-4 text-base hover:bg-gray-900"
            >
              View careers
            </Link>
          </div>
        </div>
      </footer>

      <MobileAppDock />
    </div>
  );
}
