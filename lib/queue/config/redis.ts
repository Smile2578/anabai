// lib/queue/config/redis.ts
import { RedisOptions } from 'ioredis'

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false, // Changé à false pour Bull
  retryStrategy: (times: number) => {
    if (times > 5) return null
    return Math.min(times * 1000, 5000)
  }
}