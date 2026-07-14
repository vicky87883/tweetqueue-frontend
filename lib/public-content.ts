import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { allBlogPosts } from './blog-data';
import { jobs } from './content';
import type { BlogPost, JobPost } from './content';
import { prisma } from './server/prisma';

const CONTENT_QUERY_TIMEOUT_MS = 2500;

const isBuildPhase = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function serializeBlogPost(post: {
  slug: string;
  title: string;
  seoTitle: string | null;
  description: string;
  category: string;
  readTime: string;
  publishedAt: Date | null;
  createdAt: Date;
  image: string | null;
  intro: string;
  sections: unknown;
  checklist: unknown;
}): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle || post.title,
    description: post.description,
    category: post.category,
    readTime: post.readTime,
    date: (post.publishedAt || post.createdAt).toISOString().slice(0, 10),
    image: post.image || '/dashboard-preview.svg',
    intro: post.intro,
    sections: safeArray<BlogPost['sections'][number]>(post.sections),
    checklist: safeArray<string>(post.checklist),
  };
}

function serializeJob(job: {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  postedAt: Date;
  validThrough: Date | null;
  summary: string;
  responsibilities: unknown;
  requirements: unknown;
}): JobPost {
  return {
    slug: job.slug,
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.type,
    salary: job.salary,
    postedAt: job.postedAt.toISOString().slice(0, 10),
    validThrough: job.validThrough ? job.validThrough.toISOString().slice(0, 10) : '',
    summary: job.summary,
    responsibilities: safeArray<string>(job.responsibilities),
    requirements: safeArray<string>(job.requirements),
  };
}

async function withContentTimeout<T>(query: Promise<T>): Promise<T | null> {
  if (isBuildPhase || !process.env.DATABASE_URL) return null;

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      query,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), CONTENT_QUERY_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function getPublicBlogPosts() {
  const posts = await withContentTimeout(
    prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })
  );

  return posts?.length ? posts.map(serializeBlogPost) : allBlogPosts;
}

export async function getPublicBlogPost(slug: string) {
  const post = await withContentTimeout(
    prisma.blogPost.findFirst({
      where: { slug, status: 'published' },
    })
  );

  return post ? serializeBlogPost(post) : allBlogPosts.find((item) => item.slug === slug) || null;
}

export async function getPublicJobs() {
  const openJobs = await withContentTimeout(
    prisma.jobOpening.findMany({
      where: { status: 'open' },
      orderBy: { postedAt: 'desc' },
      take: 100,
    })
  );

  return openJobs?.length ? openJobs.map(serializeJob) : jobs;
}

export async function getPublicJob(slug: string) {
  const job = await withContentTimeout(
    prisma.jobOpening.findFirst({
      where: { slug, status: 'open' },
    })
  );

  return job ? serializeJob(job) : jobs.find((item) => item.slug === slug) || null;
}
