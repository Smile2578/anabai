// lib/queue/config/redis.ts
import { ConnectionOptions } from 'bullmq';
import { QueueConfig } from '../types/queue.types';

// Configuration de base Redis
export const redisConfig: ConnectionOptions = {
  url: process.env.REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
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
};

// Configuration par défaut pour les queues
export const defaultQueueConfig: QueueConfig = {
  redis: redisConfig,
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
  connection: redisConfig,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 1000
  }
};