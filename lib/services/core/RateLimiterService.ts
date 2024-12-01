'use server';

import { createRedisCacheService } from './RedisCacheService';

export interface RateLimiterOptions {
  points: number;
  duration: number;
  blockDuration: number;
}

export async function createRateLimiter(options: RateLimiterOptions) {
  const cache = await createRedisCacheService({
    prefix: 'rate-limiter:',
    ttl: Math.max(options.duration, options.blockDuration)
  });

  return {
    async consume(key: string): Promise<{
      success: boolean;
      remainingPoints: number;
      msBeforeNext: number;
    }> {
      const isBlocked = await cache.exists(`${key}:blocked`);
      if (isBlocked) {
        const ttl = await cache.getTtl(`${key}:blocked`);
        return {
          success: false,
          remainingPoints: 0,
          msBeforeNext: ttl * 1000
        };
      }

      const pointsKey = `${key}:points`;
      const resetKey = `${key}:reset`;

      const points = await cache.get<number>(pointsKey) ?? options.points;
      const resetTime = await cache.get<number>(resetKey) ?? Date.now() + options.duration * 1000;

      if (Date.now() > resetTime) {
        await cache.set(pointsKey, options.points - 1);
        await cache.set(resetKey, Date.now() + options.duration * 1000);
        return {
          success: true,
          remainingPoints: options.points - 1,
          msBeforeNext: 0
        };
      }

      if (points <= 0) {
        await cache.set(`${key}:blocked`, true, options.blockDuration);
        return {
          success: false,
          remainingPoints: 0,
          msBeforeNext: options.blockDuration * 1000
        };
      }

      await cache.set(pointsKey, points - 1);
      return {
        success: true,
        remainingPoints: points - 1,
        msBeforeNext: resetTime - Date.now()
      };
    },

    async reset(key: string): Promise<void> {
      await cache.deleteMultiple(
        `${key}:points`,
        `${key}:reset`,
        `${key}:blocked`
      );
    },

    async isBlocked(key: string): Promise<boolean> {
      return await cache.exists(`${key}:blocked`);
    },

    async getRemainingPoints(key: string): Promise<number> {
      return await cache.get<number>(`${key}:points`) ?? options.points;
    }
  };
} 