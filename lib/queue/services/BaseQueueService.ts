import { Queue, Worker, Job, QueueEvents, QueueOptions as BullMQQueueOptions, WorkerOptions, JobsOptions, JobType } from 'bullmq';
import { BaseJobData, BaseJobResult } from '../types/queue.types';
import { redisConnection } from '@/lib/services/core/RedisService';

export abstract class BaseQueueService<T extends BaseJobData, R extends BaseJobResult = BaseJobResult> {
  protected queue: Queue;
  protected worker: Worker;
  protected events: QueueEvents;

  constructor(
    queueName: string,
    processor: (job: Job<T, R>) => Promise<R>,
    queueOpts?: Partial<BullMQQueueOptions>,
    workerOpts?: Partial<WorkerOptions>
  ) {
    const defaultQueueOpts: BullMQQueueOptions = {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          count: 1000,
          age: 24 * 3600,
        },
        removeOnFail: {
          count: 5000,
        },
      },
    };

    const defaultWorkerOpts: WorkerOptions = {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 1000,
      },
    };

    this.queue = new Queue(queueName, {
      ...defaultQueueOpts,
      ...queueOpts,
    });
    
    this.worker = new Worker(
      queueName,
      processor,
      {
        ...defaultWorkerOpts,
        ...workerOpts,
      }
    );

    this.events = new QueueEvents(queueName, {
      connection: redisConnection,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.worker.on('completed', (job: Job<T, R>, result: R) => {
      console.log(`Job ${job.id} completed with result:`, result);
    });

    this.worker.on('failed', (job: Job<T, R> | undefined, error: Error) => {
      console.error(`Job ${job?.id} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      console.error('Worker error:', error);
    });

    this.events.on('error', (error: Error) => {
      console.error('Queue events error:', error);
    });
  }

  protected async addJob(
    name: string,
    data: T,
    opts?: JobsOptions
  ): Promise<Job<T, R>> {
    return this.queue.add(name, data, opts);
  }

  public async getJob(jobId: string): Promise<Job<T, R> | undefined> {
    return this.queue.getJob(jobId);
  }

  public async close(): Promise<void> {
    await this.queue.close();
    await this.worker.close();
    await this.events.close();
  }

  public async pause(): Promise<void> {
    await this.queue.pause();
  }

  public async resume(): Promise<void> {
    await this.queue.resume();
  }

  public async clean(grace: number, limit = 1000, type: 'completed' | 'failed' = 'completed'): Promise<void> {
    await this.queue.clean(grace, limit, type);
  }

  public async obliterate(): Promise<void> {
    await this.queue.obliterate();
  }

  public async getJobs(
    types: JobType[],
    start = 0,
    end = 10,
    asc = false
  ): Promise<Job<T, R>[]> {
    const jobs = await this.queue.getJobs(types, start, end, asc);
    return jobs;
  }

  public async getJobCounts(): Promise<Record<string, number>> {
    return this.queue.getJobCounts();
  }

  public async isPaused(): Promise<boolean> {
    return this.queue.isPaused();
  }
} 