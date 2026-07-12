import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, Search } from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { getPublicBlogPosts } from '@/lib/public-content';

export const metadata: Metadata = {
  title: 'TweetQueue Blog - X, Twitter, Scheduling, and Posting Guides',
  description:
    'SEO-friendly guides about how to tweet, schedule posts on X, build a Twitter content calendar, write threads, and improve analytics.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const allPosts = await getPublicBlogPosts();
  const posts = allPosts.slice(0, 9);
  const featured = posts[0];
  const remaining = posts.slice(1);

  return (
    <main className="min-h-dvh bg-black pb-24 text-white md:pb-0">
      <section className="border-b border-gray-800 bg-zinc-950 px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to TweetQueue
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <FileText className="h-4 w-4" />
                TweetQueue Blog
              </div>
              <h1 className="text-balance text-4xl font-bold sm:text-6xl">X and Twitter posting guides for creators</h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Practical guides loaded from the backend when published, with static SEO fallback content so ranking pages stay stable.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1DA1F2]">Latest articles</p>
              <h2 className="mt-2 text-3xl font-bold">Fresh guides for your X workflow</h2>
            </div>
            <p className="text-sm text-gray-500">Showing {posts.length} of {allPosts.length} guides</p>
          </div>

          {featured && (
            <Link href={`/blog/${featured.slug}`} className="card group grid overflow-hidden rounded-3xl lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[240px] border-b border-gray-800 bg-black lg:border-b-0 lg:border-r">
                <Image src={featured.image} alt={`${featured.title} preview`} fill sizes="(max-width: 1024px) 100vw, 44vw" className="object-cover" priority />
              </div>
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-[#1DA1F2]"><Search className="h-4 w-4" />Featured guide</span>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-500"><Clock className="h-4 w-4" />{featured.readTime}</span>
                </div>
                <h2 className="mb-4 text-balance text-3xl font-bold group-hover:text-[#1DA1F2] sm:text-5xl">{featured.title}</h2>
                <p className="text-base leading-relaxed text-gray-400">{featured.description}</p>
              </div>
            </Link>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card group overflow-hidden rounded-3xl">
                <div className="relative min-h-[190px] border-b border-gray-800 bg-black">
                  <Image src={post.image} alt={`${post.title} preview`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-[#1DA1F2]">{post.category}</span>
                    <span className="text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-[#1DA1F2]">{post.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-800 bg-zinc-950 px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-center sm:text-left lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Turn your X strategy into a queue</h2>
            <p className="mt-2 text-gray-400">Create your account and start organizing the next week of posts.</p>
          </div>
          <Link href="/register" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-gray-200">Start Scheduling Free</Link>
        </div>
      </section>

      <MobileAppDock />
    </main>
  );
}
