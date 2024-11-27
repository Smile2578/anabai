import { cache } from 'react';
import { LRUCache } from 'lru-cache';

const globalCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

export function createCacheKey(...args: unknown[]): string {
  return args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(':');
}

export const getCachedData = cache(async function<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { ttl?: number }
): Promise<T> {
  const cached = globalCache.get(key) as T | undefined;
  if (cached) return cached;

  const data = await fetchFn();
  globalCache.set(key, data, { ttl: options?.ttl });
  return data;
});

export function invalidateCache(keyPattern: string) {
  const keys = Array.from(globalCache.keys());
  keys.forEach(key => {
    if (key.includes(keyPattern)) {
      globalCache.delete(key);
    }
  });
}

export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  options?: { ttl?: number }
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = `${keyPrefix}:${createCacheKey(...args)}`;
    return getCachedData(cacheKey, () => fn(...args), options);
  };
}; 