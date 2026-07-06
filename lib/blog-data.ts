import type { BlogPost } from './content';
import { aiBlogPosts } from './ai-blog-posts';
import { blogPosts } from './content';
import { freshBlogPosts } from './fresh-blog-posts';
import { growthBlogPosts } from './growth-blog-posts';
import { tweetQueueFeatureBlogPosts } from './tweetqueue-feature-blog-posts';
import { xKeywordBlogPosts } from './x-keyword-blog-posts';

export const BLOG_POSTS_PER_PAGE = 9;

const blogPostSources = [
  ...growthBlogPosts,
  ...aiBlogPosts,
  ...tweetQueueFeatureBlogPosts,
  ...xKeywordBlogPosts,
  ...freshBlogPosts,
  ...blogPosts,
];

function uniqueBySlug(posts: BlogPost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug, post])).values());
}

export const allBlogPosts = uniqueBySlug(blogPostSources);

export const totalBlogPages = Math.ceil(allBlogPosts.length / BLOG_POSTS_PER_PAGE);

export function getBlogPagePosts(page: number) {
  const start = (page - 1) * BLOG_POSTS_PER_PAGE;
  return allBlogPosts.slice(start, start + BLOG_POSTS_PER_PAGE);
}

export function getBlogPageHref(page: number) {
  return page === 1 ? '/blog' : `/blog/page/${page}`;
}
