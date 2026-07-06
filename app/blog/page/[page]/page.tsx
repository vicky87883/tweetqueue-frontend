import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { allBlogPosts, getBlogPageHref, getBlogPagePosts, totalBlogPages } from '@/lib/blog-data';

type BlogPaginationPageProps = {
  params: Promise<{ page: string }>;
};

export function generateStaticParams() {
  return Array.from({ length: Math.max(totalBlogPages - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: BlogPaginationPageProps): Promise<Metadata> {
  const { page } = await params;
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 2 || currentPage > totalBlogPages) {
    return {};
  }

  return {
    title: `TweetQueue Blog - Page ${currentPage}`,
    description: `More TweetQueue guides about X scheduling, Twitter posting, content calendars, AI writing, and creator growth. Page ${currentPage}.`,
    alternates: {
      canonical: `/blog/page/${currentPage}`,
    },
  };
}

export default async function BlogPaginationPage({ params }: BlogPaginationPageProps) {
  const { page } = await params;
  const currentPage = Number(page);

  if (!Number.isInteger(currentPage) || currentPage < 2 || currentPage > totalBlogPages) {
    notFound();
  }

  const posts = getBlogPagePosts(currentPage);
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <main className="min-h-dvh bg-black pb-24 text-white md:pb-0">
      <section className="border-b border-gray-800 bg-zinc-950 px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-sm text-[#1DA1F2]">
                <FileText className="h-4 w-4" />
                TweetQueue Blog
              </div>
              <h1 className="text-balance text-4xl font-bold sm:text-6xl">
                More X and Twitter guides
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Continue reading practical guides for scheduling, writing, planning, and improving your X content workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1DA1F2]">Article archive</p>
              <h2 className="mt-2 text-3xl font-bold">Guides page {currentPage}</h2>
            </div>
            <p className="text-sm text-gray-500">
              Showing 9 of {allBlogPosts.length} guides · Page {currentPage} of {totalBlogPages}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card group overflow-hidden rounded-3xl"
              >
                <div className="relative min-h-[190px] border-b border-gray-800 bg-black">
                  <Image
                    src={post.image}
                    alt={`${post.title} preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-[#1DA1F2]">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-[#1DA1F2]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{post.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <nav className="mt-10 flex flex-col gap-4 rounded-3xl border border-gray-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Blog pagination">
            <span className="text-sm text-gray-500">Page {currentPage} of {totalBlogPages}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={getBlogPageHref(previousPage)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-[#1DA1F2] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
              {Array.from({ length: totalBlogPages }, (_, index) => index + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={getBlogPageHref(pageNumber)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    pageNumber === currentPage
                      ? 'bg-white text-black'
                      : 'border border-gray-800 text-gray-400 hover:border-[#1DA1F2] hover:text-white'
                  }`}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </Link>
              ))}
              {currentPage < totalBlogPages ? (
                <Link
                  href={getBlogPageHref(nextPage)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1DA1F2] px-4 py-2 text-sm font-bold text-black transition hover:bg-sky-400"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-gray-800 px-4 py-2 text-sm text-gray-600">
                  Next <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </nav>
        </div>
      </section>

      <MobileAppDock />
    </main>
  );
}
