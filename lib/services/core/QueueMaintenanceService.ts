import { Queue } from 'bullmq';
import { EventEmitter } from 'events';

export interface MaintenanceConfig {
  cleanupInterval: number;
  retentionPeriod: number;
  maxCompletedJobs: number;
  maxFailedJobs: number;
}

export interface QueueStats {
  completed: number;
  failed: number;
  delayed: number;
  active: number;
  waiting: number;
}

export class QueueMaintenanceService extends EventEmitter {
  private queues: Map<string, Queue>;
  private config: MaintenanceConfig;
  private maintenanceInterval?: NodeJS.Timeout;

  constructor(config: Partial<MaintenanceConfig> = {}) {
    super();
    this.queues = new Map();
    this.config = {
      cleanupInterval: config.cleanupInterval || 3600000, // 1 heure
      retentionPeriod: config.retentionPeriod || 604800000, // 7 jours
      maxCompletedJobs: config.maxCompletedJobs || 1000,
      maxFailedJobs: config.maxFailedJobs || 500
    };
  }

  public registerQueue(queue: Queue): void {
    this.queues.set(queue.name, queue);
    this.emit('queueRegistered', { queueName: queue.name });
  }

  public async startMaintenance(): Promise<void> {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }

    // Exécuter immédiatement la première maintenance
    await this.performMaintenance();

    // Planifier les maintenances suivantes
    this.maintenanceInterval = setInterval(
      () => this.performMaintenance(),
      this.config.cleanupInterval
    );

    this.emit('maintenanceStarted', {
      interval: this.config.cleanupInterval,
      timestamp: new Date()
    });
  }

  public async stopMaintenance(): Promise<void> {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = undefined;
      this.emit('maintenanceStopped', { timestamp: new Date() });
    }
  }

  private async performMaintenance(): Promise<void> {
    const startTime = Date.now();
    const results: Record<string, {
      cleaned: number;
      errors?: string;
    }> = {};

    for (const [queueName, queue] of this.queues.entries()) {
      try {
        // Nettoyer les jobs terminés
        const completedCleaned = await queue.clean(
          this.config.retentionPeriod,
          this.config.maxCompletedJobs,
          'completed'
        );

        // Nettoyer les jobs échoués
        const failedCleaned = await queue.clean(
          this.config.retentionPeriod,
          this.config.maxFailedJobs,
          'failed'
        );

        results[queueName] = {
          cleaned: completedCleaned.length + failedCleaned.length
        };

        this.emit('queueCleaned', {
          queueName,
          completedCleaned: completedCleaned.length,
          failedCleaned: failedCleaned.length,
          timestamp: new Date()
        });
      } catch (error) {
        results[queueName] = {
          cleaned: 0,
          errors: error instanceof Error ? error.message : 'Unknown error'
        };

        this.emit('cleanupError', {
          queueName,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    const duration = Date.now() - startTime;
    this.emit('maintenanceCompleted', {
      duration,
      results,
      timestamp: new Date()
    });
  }

  public async cleanStuckJobs(): Promise<void> {
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        // Récupérer et nettoyer les jobs bloqués
        const stuckJobs = await queue.getJobs(['active']);
        for (const job of stuckJobs) {
          const processingTime = Date.now() - (job.processedOn || 0);
          if (processingTime > this.config.retentionPeriod) {
            await job.moveToFailed(
              new Error('Job stuck in active state'),
              'maintenance'
            );
          }
        }

        this.emit('stuckJobsCleaned', {
          queueName,
          count: stuckJobs.length,
          timestamp: new Date()
        });
      } catch (error) {
        this.emit('cleanStuckError', {
          queueName,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }
  }

  public async getMaintenanceStats(): Promise<Record<string, QueueStats>> {
    const stats: Record<string, QueueStats> = {};

    for (const [queueName, queue] of this.queues.entries()) {
      const counts = await queue.getJobCounts();
      stats[queueName] = {
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0,
        active: counts.active || 0,
        waiting: counts.waiting || 0
      };
    }

    return stats;
  }

  public updateConfig(newConfig: Partial<MaintenanceConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };

    // Redémarrer la maintenance si elle est active
    if (this.maintenanceInterval) {
      this.startMaintenance();
    }
  }
} 