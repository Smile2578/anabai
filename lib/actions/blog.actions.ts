'use server';

import { createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import { BlogPost, BlogPostStatus } from '@/types/blog';

let blogCache: Awaited<ReturnType<typeof createRedisCacheService>>;

async function getBlogCache() {
  if (!blogCache) {
    blogCache = await createRedisCacheService({
      prefix: 'blog:',
      ttl: 3600 // 1 heure
    });
  }
  return blogCache;
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const cache = await getBlogCache();
  return cache.get<BlogPost>(id);
}

export async function setBlogPost(id: string, post: BlogPost): Promise<void> {
  const cache = await getBlogCache();
  await cache.set(id, post);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const cache = await getBlogCache();
  await cache.delete(id);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const cache = await getBlogCache();
  const keys = await cache.keys('*');
  const posts: BlogPost[] = [];

  for (const key of keys) {
    const post = await cache.get<BlogPost>(key);
    if (post) {
      posts.push(post);
    }
  }

  return posts;
}

export async function createBlogPost(post: BlogPost): Promise<BlogPost> {
  const id = post._id.toString();
  await setBlogPost(id, post);
  return post;
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
  const existingPost = await getBlogPost(id);
  if (!existingPost) return null;

  const updatedPost = {
    ...existingPost,
    ...post,
    updatedAt: new Date()
  };

  await setBlogPost(id, updatedPost);
  return updatedPost;
}

export async function publishBlogPost(id: string): Promise<BlogPost | null> {
  const post = await getBlogPost(id);
  if (!post) return null;

  const publishedPost: BlogPost = {
    ...post,
    status: 'published' as BlogPostStatus,
    publishedAt: new Date(),
    updatedAt: new Date()
  };

  await setBlogPost(id, publishedPost);
  return publishedPost;
}

export async function unpublishBlogPost(id: string): Promise<BlogPost | null> {
  const post = await getBlogPost(id);
  if (!post) return null;

  const unpublishedPost: BlogPost = {
    ...post,
    status: 'draft' as BlogPostStatus,
    updatedAt: new Date()
  };

  await setBlogPost(id, unpublishedPost);
  return unpublishedPost;
} 