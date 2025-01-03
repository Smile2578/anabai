'use server';

import Redis from 'ioredis';

export interface RedisCacheOptions {
  prefix: string;
  ttl: number;
}

export interface RedisCacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getTtl(key: string): Promise<number>;
  increment(key: string): Promise<number>;
  removeMultiple(...keys: string[]): Promise<void>;
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
      const data = await getClient().get(getKey(key));
      return data ? JSON.parse(data) : null;
    },

    async set<T>(key: string, value: T, ttl: number = defaultTtl): Promise<void> {
      await getClient().set(
        getKey(key),
        JSON.stringify(value),
        'EX',
        ttl
      );
    },

    async remove(key: string): Promise<void> {
      await getClient().del(getKey(key));
    },

    async exists(key: string): Promise<boolean> {
      const result = await getClient().exists(getKey(key));
      return result === 1;
    },

    async getTtl(key: string): Promise<number> {
      return await getClient().ttl(getKey(key));
    },

    async increment(key: string): Promise<number> {
      return await getClient().incr(getKey(key));
    },

    async removeMultiple(...keys: string[]): Promise<void> {
      if (keys.length > 0) {
        await getClient().del(...keys.map(getKey));
      }
    },

    async clearPattern(pattern: string): Promise<void> {
      const keys = await getClient().keys(getKey(pattern));
      if (keys.length > 0) {
        await getClient().del(...keys);
      }
    },

    async keys(pattern: string): Promise<string[]> {
      return await getClient().keys(getKey(pattern));
    }
  };
} 