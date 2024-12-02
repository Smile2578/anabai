// lib/services/core/RedisService.ts
import IORedis from 'ioredis';
import { ConnectionOptions } from 'bullmq';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Les variables d\'environnement Redis REST ne sont pas configurées');
}

// Client IORedis principal
export const redisClient = new IORedis({
  host: 'solid-foal-48180.upstash.io',
  port: 6379,
  username: 'default',
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > 5) return null;
    return Math.min(times * 1000, 5000);
  }
});

// Configuration Redis pour BullMQ
export const redisConnection: ConnectionOptions = {
  host: 'solid-foal-48180.upstash.io',
  port: 6379,
  username: 'default',
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: null
};