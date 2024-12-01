import { Queue, Worker, QueueEvents, Job, JobsOptions, WorkerOptions } from 'bullmq';
import { EventEmitter } from 'events';
import IORedis from 'ioredis';
import { QueueErrorHandlingService } from './QueueErrorHandlingService';
import { QueueMaintenanceService } from './QueueMaintenanceService';
import { QueueMetricsService } from './QueueMetricsService';
import { RedisMonitoringService } from './RedisMonitoringService';
import { redisConnection } from './RedisService';
import { getRedisConfig } from '../../config/queue.config';

export interface BaseJobData {
  userId: string;
  [key: string]: unknown;
}

export interface BaseJobResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export interface QueueManagerConfig {
  redis: IORedis;
  maxRetries: number;
  initialBackoff: number;
  concurrency: number;
  maxStalledCount: number;
  stalledInterval: number;
  cleanupInterval: number;
  monitoringInterval: number;
}

export class QueueManagerService extends EventEmitter {
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private queueEvents: Map<string, QueueEvents>;
  private errorHandler: QueueErrorHandlingService;
  private maintenance: QueueMaintenanceService;
  private metrics: QueueMetricsService;
  private monitoring: RedisMonitoringService;
  private config: QueueManagerConfig;

  constructor(config: QueueManagerConfig) {
    super();
    this.queues = new Map();
    this.workers = new Map();
    this.queueEvents = new Map();
    this.config = config;
    const redisConfig = getRedisConfig();
    const redis = new IORedis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      enableReadyCheck: redisConfig.enableReadyCheck
    });
    this.monitoring = new RedisMonitoringService(redis);
    
    this.errorHandler = new QueueErrorHandlingService(
      this.monitoring,
      {
        maxRetries: config.maxRetries,
        monitoringEnabled: true
      }
    );

    this.maintenance = new QueueMaintenanceService({
      cleanupInterval: config.cleanupInterval,
      maxFailedJobs: config.maxRetries,
      retentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    this.metrics = new QueueMetricsService(this.monitoring, {
      collectInterval: config.monitoringInterval,
      retentionPeriod: 24 * 60 * 60 * 1000 // 24 heures
    });

    this.setupMaintenanceJobs();
  }

  public async registerQueue<T extends BaseJobData>(
    name: string,
    processor: (job: Job<T>) => Promise<BaseJobResult>,
    options: {
      defaultJobOptions?: JobsOptions;
      settings?: WorkerOptions;
    } = {}
  ): Promise<Queue<T>> {
    const queue = new Queue<T>(name, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: this.config.maxRetries,
        backoff: {
          type: 'exponential',
          delay: this.config.initialBackoff
        },
        ...options.defaultJobOptions
      }
    });

    const worker = new Worker<T>(name, processor, {
      connection: redisConnection,
      concurrency: this.config.concurrency,
      maxStalledCount: this.config.maxStalledCount,
      stalledInterval: this.config.stalledInterval,
      ...options.settings
    });

    const queueEvents = new QueueEvents(name, {
      connection: redisConnection
    });

    worker.on('failed', async (job, error) => {
      if (job) {
        await this.errorHandler.handleJobError(error, job as Job<BaseJobData>, queue);
      }
    });

    this.queues.set(name, queue);
    this.workers.set(name, worker);
    this.queueEvents.set(name, queueEvents);

    await this.metrics.trackQueue(queue);
    this.maintenance.registerQueue(queue);

    return queue;
  }

  private setupMaintenanceJobs(): void {
    setInterval(async () => {
      try {
        await this.maintenance.cleanStuckJobs();
      } catch (error) {
        console.error('Erreur lors du nettoyage des jobs:', error);
      }
    }, this.config.cleanupInterval);

    setInterval(async () => {
      try {
        await this.metrics.startTracking();
      } catch (error) {
        console.error('Erreur lors de la collecte des métriques:', error);
      }
    }, this.config.monitoringInterval);
  }

  public getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  public getWorker(name: string): Worker | undefined {
    return this.workers.get(name);
  }

  public getQueueEvents(name: string): QueueEvents | undefined {
    return this.queueEvents.get(name);
  }

  public async close(): Promise<void> {
    await Promise.all([
      ...Array.from(this.workers.values()).map(worker => worker.close()),
      ...Array.from(this.queues.values()).map(queue => queue.close()),
      ...Array.from(this.queueEvents.values()).map(events => events.close())
    ]);

    await this.metrics.stopTracking();
    await this.maintenance.stopMaintenance();
    this.monitoring.stop();
  }

  public async retryFailedJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} non trouvée`);
    }
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} non trouvé`);
    }
    await job.retry();
  }

  public async getAllJobs(): Promise<Record<string, Job[]>> {
    const result: Record<string, Job[]> = {};
    for (const [queueName, queue] of this.queues.entries()) {
      const jobs = await queue.getJobs(['active', 'waiting', 'failed', 'completed'], 0, 100);
      result[queueName] = jobs;
    }
    return result;
  }

  public async deleteJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} non trouvée`);
    }
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} non trouvé`);
    }
    await job.remove();
  }
} 