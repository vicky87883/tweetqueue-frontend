import { allBlogPosts } from './blog-data';
import { jobs } from './content';
import type { BlogPost, JobPost } from './content';

const DEFAULT_BACKEND_URL = 'https://tweetqueue-1.onrender.com';

function backendBaseUrl() {
  const configured = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  return configured.replace(/\/+$/, '');
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${backendBaseUrl()}${path}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getPublicBlogPosts() {
  const data = await readJson<{ success: boolean; posts: BlogPost[] }>('/api/blog-posts');
  return data?.posts?.length ? data.posts : allBlogPosts;
}

export async function getPublicBlogPost(slug: string) {
  const data = await readJson<{ success: boolean; post: BlogPost }>(`/api/blog-posts/${slug}`);
  return data?.post || allBlogPosts.find((post) => post.slug === slug) || null;
}

export async function getPublicJobs() {
  const data = await readJson<{ success: boolean; jobs: JobPost[] }>('/api/jobs');
  return data?.jobs?.length ? data.jobs : jobs;
}

export async function getPublicJob(slug: string) {
  const data = await readJson<{ success: boolean; job: JobPost }>(`/api/jobs/${slug}`);
  return data?.job || jobs.find((job) => job.slug === slug) || null;
}
