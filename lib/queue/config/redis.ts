// lib/queue/config/redis.ts
import { QueueOptions } from 'bullmq';
import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Les variables d\'environnement Upstash Redis ne sont pas configurées');
}

// Client Upstash Redis
export const upstashRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Configuration IORedis pour BullMQ
export const ioRedisClient = new IORedis({
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
  },
  reconnectOnError: (error: Error) => {
    const targetError = 'READONLY';
    if (error.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Configuration Redis commune
const redisConnection = {
  host: 'solid-foal-48180.upstash.io',
  port: 6379,
  username: 'default',
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {
    rejectUnauthorized: false
  }
};

// Configuration par défaut pour les queues
export const defaultQueueConfig: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 3600
    },
    removeOnFail: {
      count: 5000
    }
  }
};

// Configuration par défaut pour les workers
export const defaultWorkerConfig = {
  connection: redisConnection,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 1000
  }
};