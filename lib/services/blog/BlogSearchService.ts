import { RedisCacheService, createRedisCacheService } from '../core/RedisCacheService';
import { BlogPost } from '@/types/blog';

interface SearchResult {
  posts: BlogPost[];
  total: number;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

interface SearchParams {
  query: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export class BlogSearchService {
  private cache: RedisCacheService | null = null;
  private readonly CACHE_PREFIX = 'blog:search:';
  private readonly CACHE_TTL = 3600;

  private async getCache(): Promise<RedisCacheService> {
    if (!this.cache) {
      this.cache = await createRedisCacheService({
        prefix: this.CACHE_PREFIX,
        ttl: this.CACHE_TTL,
      });
    }
    return this.cache;
  }

  private generateCacheKey(params: SearchParams): string {
    const { query, tags = [], page = 1, limit = 10 } = params;
    return `${query}:${tags.sort().join(',')}:${page}:${limit}`;
  }

  public async search(params: SearchParams): Promise<SearchResult> {
    const cacheKey = this.generateCacheKey(params);
    
    // Vérifier le cache
    const cache = await this.getCache();
    const cachedResult = await cache.get<SearchResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Si pas en cache, effectuer la recherche
    const result = await this.performSearch(params);
    
    // Mettre en cache le résultat
    await cache.set(cacheKey, result);
    
    return result;
  }

  private async performSearch(params: SearchParams): Promise<SearchResult> {
    const { query, tags = [], page = 1, limit = 10 } = params;
    
    // Appel à l'API de recherche
    const response = await fetch('/api/blog/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tags, page, limit })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    return response.json();
  }

  public async invalidateCache(pattern?: string): Promise<void> {
    const cache = await this.getCache();
    if (pattern) {
      await cache.clearPattern(`${pattern}*`);
    } else {
      await cache.clearPattern('*');
    }
  }

  public async warmupCache(popularSearches: SearchParams[]): Promise<void> {
    const promises = popularSearches.map(params => this.search(params));
    await Promise.all(promises);
  }
} 