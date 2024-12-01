import { Job, Queue } from 'bullmq';
import { BaseJobData, BaseJobResult } from '@/lib/queue/types/queue.types';
import { RedisMonitoringService } from './RedisMonitoringService';
import { EventEmitter } from 'events';

export interface ErrorHandlingConfig {
  maxRetries: number;
  backoffDelay: number;
  alertThreshold: number;
  monitoringEnabled: boolean;
}

export class QueueErrorHandlingService extends EventEmitter {
  private monitoring: RedisMonitoringService;
  private errorCounts: Map<string, number>;
  private config: ErrorHandlingConfig;

  constructor(
    monitoring: RedisMonitoringService,
    config: Partial<ErrorHandlingConfig> = {}
  ) {
    super();
    this.monitoring = monitoring;
    this.errorCounts = new Map();
    this.config = {
      maxRetries: config.maxRetries || 3,
      backoffDelay: config.backoffDelay || 1000,
      alertThreshold: config.alertThreshold || 10,
      monitoringEnabled: config.monitoringEnabled ?? true
    };
  }

  async handleJobError<T extends BaseJobData>(
    error: Error,
    job: Job<T, BaseJobResult>,
    queue: Queue
  ): Promise<void> {
    console.error(`Error in job ${job.id} (${queue.name}):`, error);

    // Incrémenter le compteur d'erreurs
    const errorKey = `${queue.name}:${error.name}`;
    const currentCount = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, currentCount);

    // Vérifier le seuil d'alerte
    if (currentCount >= this.config.alertThreshold) {
      this.emit('alert', {
        queueName: queue.name,
        errorType: error.name,
        count: currentCount,
        message: `Error threshold reached for ${queue.name}`
      });
      this.errorCounts.delete(errorKey);
    }

    // Gérer les retries
    const attempts = job.attemptsMade;
    if (attempts < this.config.maxRetries) {
      const delay = this.calculateBackoff(attempts);
      await job.moveToDelayed(delay);
      console.log(`Job ${job.id} will retry in ${delay}ms (attempt ${attempts + 1}/${this.config.maxRetries})`);
    } else {
      console.error(`Job ${job.id} failed permanently after ${attempts} attempts`);
      await this.handleFailedJob(job, error);
    }

    // Mettre à jour les métriques si le monitoring est activé
    if (this.config.monitoringEnabled) {
      await this.updateErrorMetrics(queue.name, error);
    }
  }

  private calculateBackoff(attempt: number): number {
    return this.config.backoffDelay * Math.pow(2, attempt);
  }

  private async handleFailedJob<T extends BaseJobData>(
    job: Job<T, BaseJobResult>,
    error: Error
  ): Promise<void> {
    try {
      // Marquer le job comme échoué définitivement
      await job.moveToFailed(error, 'error-handling');

      // Émettre un événement pour le job échoué
      this.emit('jobFailed', {
        jobId: job.id,
        queueName: job.queueName,
        error: error.message,
        data: job.data
      });

      // Sauvegarder les détails de l'erreur pour analyse
      await this.logFailedJob(job, error);
    } catch (err) {
      console.error('Error handling failed job:', err);
    }
  }

  private async updateErrorMetrics(queueName: string, error: Error): Promise<void> {
    try {
      const metrics = this.monitoring.getMetrics();
      this.emit('metricsUpdated', {
        queueName,
        errorType: error.name,
        metrics
      });
    } catch (err) {
      console.error('Error updating metrics:', err);
    }
  }

  private async logFailedJob<T extends BaseJobData>(
    job: Job<T, BaseJobResult>,
    error: Error
  ): Promise<void> {
    const failedJob = {
      id: job.id,
      queue: job.queueName,
      timestamp: new Date(),
      attempts: job.attemptsMade,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      data: job.data
    };

    // Émettre un événement avec les détails du job échoué
    this.emit('failedJobLogged', failedJob);
  }

  public getErrorStats(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  public clearErrorStats(): void {
    this.errorCounts.clear();
  }

  public updateConfig(newConfig: Partial<ErrorHandlingConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
} 