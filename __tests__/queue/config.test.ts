// __tests__/queue/config.test.ts

import { redisConnection, queueConfig } from '@/lib/queue/config';

describe('Redis Configuration', () => {
  afterAll(async () => {
    await redisConnection.quit();
  });

  it('should create a valid redis connection', () => {
    expect(redisConnection).toBeDefined();
    expect(redisConnection.status).toBe('ready');
  });

  it('should have correct queue configuration', () => {
    expect(queueConfig.defaultJobOptions).toHaveProperty('attempts', 3);
    expect(queueConfig.defaultJobOptions.backoff.type).toBe('exponential');
  });
});