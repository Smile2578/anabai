import { RedisCacheService, createRedisCacheService } from '../core/RedisCacheService';
import { BlogPost } from '@/types/blog';

export class BlogCacheService {
  private cache: RedisCacheService | null = null;
  private readonly POST_CACHE_PREFIX = 'blog:post:';
  private readonly POST_CACHE_TTL = 3600;

  private async getCache(): Promise<RedisCacheService> {
    if (!this.cache) {
      this.cache = await createRedisCacheService({
        prefix: this.POST_CACHE_PREFIX,
        ttl: this.POST_CACHE_TTL,
      });
    }
    return this.cache;
  }

  async getPost(id: string): Promise<BlogPost | null> {
    const cache = await this.getCache();
    return cache.get<BlogPost>(id);
  }

  async setPost(id: string, post: BlogPost): Promise<void> {
    const cache = await this.getCache();
    await cache.set(id, post);
  }

  async deletePost(id: string): Promise<void> {
    const cache = await this.getCache();
    await cache.delete(id);
  }

  async clearAllPosts(): Promise<void> {
    const cache = await this.getCache();
    await cache.clearPattern('*');
  }

  async invalidatePost(id: string): Promise<void> {
    const cache = await this.getCache();
    await cache.delete(id);
  }

  async incrementViews(id: string): Promise<number> {
    const cache = await this.getCache();
    return cache.increment(`${id}:views`);
  }

  async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    const cache = await this.getCache();
    const posts = await cache.get<BlogPost[]>('recent');
    return posts?.slice(0, limit) || [];
  }

  async getPopularPosts(limit: number = 5): Promise<BlogPost[]> {
    const cache = await this.getCache();
    const posts = await cache.get<BlogPost[]>('popular');
    return posts?.slice(0, limit) || [];
  }

  async warmupCache(posts: BlogPost[]): Promise<void> {
    const cache = await this.getCache();
    await Promise.all(
      posts.map(post => cache.set(post._id, post))
    );
  }
} 