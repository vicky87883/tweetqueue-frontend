import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { aiBlogPosts } from '@/lib/ai-blog-posts';
import { MobileAppDock } from '@/components/mobile-app-dock';
import { getBlogEnhancement } from '@/lib/blog-enhancements';
import { blogPosts } from '@/lib/content';
import { freshBlogPosts } from '@/lib/fresh-blog-posts';
import { growthBlogPosts } from '@/lib/growth-blog-posts';
import { tweetQueueFeatureBlogPosts } from '@/lib/tweetqueue-feature-blog-posts';
import { xKeywordBlogPosts } from '@/lib/x-keyword-blog-posts';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const allBlogPosts = [...growthBlogPosts, ...aiBlogPosts, ...tweetQueueFeatureBlogPosts, ...xKeywordBlogPosts, ...freshBlogPosts, ...blogPosts];

function getPost(slug: string) {
  return allBlogPosts.find((post) => post.slug === slug);
}

export function generateStaticParams() {
  return allBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const enhancement = getBlogEnhancement(post.slug);
  const enhancedSections = [...post.sections, ...enhancement.extraSections];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    image: post.image,
    author: {
      '@type': 'Organization',
      name: 'TweetQueue',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TweetQueue',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: enhancement.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main className="min-h-dvh bg-black pb-24 text-white md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article>
        <header className="border-b border-gray-800 bg-zinc-950 px-4 py-7 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>

            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-black px-3 py-1.5 text-[#1DA1F2]">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
              <span className="inline-flex items-center gap-2 text-gray-500">
                <CalendarDays className="h-4 w-4" />
                {post.date}
              </span>
            </div>

            <h1 className="text-balance text-4xl font-black leading-tight sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              {post.intro}
            </p>

            <div className="mt-6 grid gap-3 rounded-3xl border border-[#1DA1F2]/25 bg-[#1DA1F2]/10 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1DA1F2] text-black">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">What you will learn</h2>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-gray-300">
                  {enhancement.summary.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">
              <div className="image-frame mb-8 overflow-hidden rounded-3xl">
                <Image
                  src={post.image}
                  alt={`${post.title} illustration`}
                  width={1440}
                  height={920}
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="h-auto w-full"
                  priority
                />
              </div>

              <div className="article-prose">
                {enhancedSections.map((section) => (
                  <section key={section.heading}>
                    <h2>{section.heading}</h2>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))}

                <section>
                  <h2>Quick checklist</h2>
                  <ul>
                    {post.checklist.map((item) => (
                      <li key={item} className="flex gap-3 rounded-2xl border border-gray-800 bg-zinc-950 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1DA1F2]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2>Frequently asked questions</h2>
                  <div className="mt-4 grid gap-3">
                    {enhancement.faq.map((item) => (
                      <div key={item.question} className="rounded-2xl border border-gray-800 bg-zinc-950 p-5">
                        <h3 className="text-lg font-bold text-white">{item.question}</h3>
                        <p className="mt-2 text-gray-400">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-10 rounded-3xl border border-gray-800 bg-zinc-950 p-6 text-center sm:p-8">
                <h2 className="text-2xl font-bold">Plan these ideas inside TweetQueue</h2>
                <p className="mx-auto mt-3 max-w-2xl text-gray-400">
                  Turn the checklist into scheduled posts, review the week, and keep your X
                  content consistent without rushing every day.
                </p>
                <Link
                  href="/register"
                  className="mt-6 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-black hover:bg-gray-200"
                >
                  Start Scheduling Free
                </Link>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-3xl border border-gray-800 bg-zinc-950 p-5">
                <div className="text-sm font-bold text-[#1DA1F2]">In this guide</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  {enhancedSections.slice(0, 7).map((section) => (
                    <div key={section.heading} className="border-l border-gray-800 pl-3">
                      {section.heading}
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  className="mt-5 block rounded-2xl bg-[#1DA1F2] px-4 py-3 text-center text-sm font-bold text-black"
                >
                  Try TweetQueue
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <MobileAppDock />
    </main>
  );
}
