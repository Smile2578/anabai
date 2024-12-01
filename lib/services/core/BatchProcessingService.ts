import { Queue, Job } from 'bullmq';
import { EventEmitter } from 'events';

export interface BatchConfig {
  batchSize: number;
  batchTimeout: number;
  maxConcurrent: number;
}

export interface BatchJob<T = unknown> {
  id: string;
  data: T;
}

export interface BatchResult<T = unknown, R = unknown> {
  jobId: string;
  data: T;
  result?: R;
  error?: Error;
}

export class BatchProcessingService extends EventEmitter {
  private queue: Queue;
  private config: BatchConfig;
  private currentBatch: BatchJob[] = [];
  private batchTimeout?: NodeJS.Timeout;
  private processing: boolean = false;
  private activePromises: Set<Promise<void>> = new Set();

  constructor(queue: Queue, config: BatchConfig) {
    super();
    this.queue = queue;
    this.config = config;
  }

  public async addToBatch<T>(job: Job<T>): Promise<void> {
    this.currentBatch.push({
      id: job.id as string,
      data: job.data
    });

    if (this.currentBatch.length >= this.config.batchSize) {
      await this.processBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(
        () => this.processBatch(),
        this.config.batchTimeout
      );
    }
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.currentBatch.length === 0) return;

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = undefined;
    }

    this.processing = true;
    const batchToProcess = [...this.currentBatch];
    this.currentBatch = [];

    try {
      // Diviser le batch en sous-groupes selon maxConcurrent
      const chunks = this.chunkArray(batchToProcess, this.config.maxConcurrent);

      for (const chunk of chunks) {
        const promises = chunk.map(job => this.processJob(job));
        const promise = Promise.all(promises).then(() => {
          this.activePromises.delete(promise);
        });
        this.activePromises.add(promise);
        await promise;
      }
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.processing = false;

      // Vérifier s'il y a de nouveaux jobs à traiter
      if (this.currentBatch.length > 0) {
        await this.processBatch();
      }
    }
  }

  private async processJob<T>(job: BatchJob<T>): Promise<void> {
    try {
      const result = await this.processSingleJob();
      this.emit('job-completed', {
        jobId: job.id,
        data: job.data,
        result
      });
    } catch (error) {
      this.emit('job-failed', {
        jobId: job.id,
        data: job.data,
        error
      });
    }
  }

  private async processSingleJob(): Promise<unknown> {
    // Cette méthode doit être surchargée par les classes filles
    throw new Error('processSingleJob must be implemented by child class');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  public async flush(): Promise<void> {
    if (this.currentBatch.length > 0) {
      await this.processBatch();
    }
    await Promise.all(Array.from(this.activePromises));
  }

  public getCurrentBatchSize(): number {
    return this.currentBatch.length;
  }

  public isProcessing(): boolean {
    return this.processing;
  }

  public getActivePromisesCount(): number {
    return this.activePromises.size;
  }
} 