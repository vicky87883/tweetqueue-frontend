import type { MetadataRoute } from 'next';
import { allBlogPosts, totalBlogPages } from '@/lib/blog-data';
import { jobs } from '@/lib/content';

const baseUrl = 'https://tweetqueue.com';

function uniqueByUrl<T extends { url: string }>(routes: T[]) {
  return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/blog', '/careers', '/login', '/register'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date('2026-05-26'),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const blogPaginationRoutes = Array.from({ length: Math.max(totalBlogPages - 1, 0) }, (_, index) => ({
    url: `${baseUrl}/blog/page/${index + 2}`,
    lastModified: new Date('2026-05-26'),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogRoutes = allBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const jobRoutes = jobs.map((job) => ({
    url: `${baseUrl}/careers/${job.slug}`,
    lastModified: new Date(job.postedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return uniqueByUrl([...staticRoutes, ...blogPaginationRoutes, ...blogRoutes, ...jobRoutes]);
}
