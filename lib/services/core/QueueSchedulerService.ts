import { Queue, Worker } from 'bullmq';
import { redisConfig } from '@/lib/queue/config/redis';
import { logger } from '@/lib/logger';

export class QueueSchedulerService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor() {
    this.initializeQueues();
  }

  private async initializeQueues() {
    try {
      // Initialiser les queues avec leurs workers respectifs
      const queueConfigs = [
        { name: 'blog', concurrency: 5 },
        { name: 'place', concurrency: 3 },
        { name: 'image', concurrency: 2 },
        { name: 'import', concurrency: 1 }
      ];

      for (const config of queueConfigs) {
        const queue = new Queue(config.name, {
          connection: redisConfig,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: false
          }
        });

        const worker = new Worker(
          config.name,
          async (job) => {
            // Le traitement sera géré par les services spécifiques
            logger.info(`Processing job ${job.id} from queue ${config.name}`);
          },
          {
            connection: redisConfig,
            concurrency: config.concurrency,
            autorun: true
          }
        );

        this.queues.set(config.name, queue);
        this.workers.set(config.name, worker);

        worker.on('completed', (job) => {
          logger.info(`Job ${job.id} completed in queue ${config.name}`);
        });

        worker.on('failed', (job, error) => {
          logger.error(`Job ${job?.id} failed in queue ${config.name}:`, error);
        });
      }

      logger.info('Queue scheduler service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize queue scheduler service:', error);
      throw error;
    }
  }

  async getQueue(name: string): Promise<Queue | undefined> {
    return this.queues.get(name);
  }

  async getWorker(name: string): Promise<Worker | undefined> {
    return this.workers.get(name);
  }

  async close(): Promise<void> {
    try {
      // Fermer proprement toutes les queues et workers
      for (const [name, queue] of this.queues) {
        await queue.close();
        logger.info(`Queue ${name} closed`);
      }

      for (const [name, worker] of this.workers) {
        await worker.close();
        logger.info(`Worker ${name} closed`);
      }

      this.queues.clear();
      this.workers.clear();
      logger.info('Queue scheduler service closed successfully');
    } catch (error) {
      logger.error('Error closing queue scheduler service:', error);
      throw error;
    }
  }
}

export const queueScheduler = new QueueSchedulerService(); 