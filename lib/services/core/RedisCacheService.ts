'use server';

import Redis from 'ioredis';

export interface RedisCacheOptions {
  prefix: string;
  ttl: number;
}

export interface RedisCacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getTtl(key: string): Promise<number>;
  increment(key: string): Promise<number>;
  deleteMultiple(...keys: string[]): Promise<void>;
  clearPattern(pattern: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }
    client = new Redis(redisUrl);
  }
  return client;
}

export async function createRedisCacheService(options: RedisCacheOptions): Promise<RedisCacheService> {
  const prefix = options.prefix;
  const defaultTtl = options.ttl;

  const getKey = (key: string): string => `${prefix}${key}`;

  return {
    async get<T>(key: string): Promise<T | null> {
      'use server';
      const data = await getClient().get(getKey(key));
      return data ? JSON.parse(data) : null;
    },

    async set<T>(key: string, value: T, ttl: number = defaultTtl): Promise<void> {
      'use server';
      await getClient().set(
        getKey(key),
        JSON.stringify(value),
        'EX',
        ttl
      );
    },

    async delete(key: string): Promise<void> {
      'use server';
      await getClient().del(getKey(key));
    },

    async exists(key: string): Promise<boolean> {
      'use server';
      const result = await getClient().exists(getKey(key));
      return result === 1;
    },

    async getTtl(key: string): Promise<number> {
      'use server';
      return await getClient().ttl(getKey(key));
    },

    async increment(key: string): Promise<number> {
      'use server';
      return await getClient().incr(getKey(key));
    },

    async deleteMultiple(...keys: string[]): Promise<void> {
      'use server';
      if (keys.length > 0) {
        await getClient().del(...keys.map(getKey));
      }
    },

    async clearPattern(pattern: string): Promise<void> {
      'use server';
      const keys = await getClient().keys(getKey(pattern));
      if (keys.length > 0) {
        await getClient().del(...keys);
      }
    },

    async keys(pattern: string): Promise<string[]> {
      'use server';
      return await getClient().keys(getKey(pattern));
    }
  };
} 