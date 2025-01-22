import { Queue, Job } from 'bullmq';

export class BaseQueueService {
  protected queue: Queue;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  }

  protected async add<T>(jobName: string, data: T): Promise<Job<T>> {
    return this.queue.add(jobName, data);
  }
} 