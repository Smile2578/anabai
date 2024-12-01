import { Queue } from 'bullmq';
import { EventEmitter } from 'events';
import { RedisMonitoringService } from './RedisMonitoringService';

export interface QueueMetrics {
  processed: number;
  failed: number;
  delayed: number;
  active: number;
  waiting: number;
  completed: number;
  throughput: number;
  latency: number;
  errorRate: number;
  timestamp: number;
}

export interface MetricsConfig {
  collectInterval: number;
  retentionPeriod: number;
  samplingRate: number;
}

export class QueueMetricsService extends EventEmitter {
  private queues: Map<string, Queue>;
  private metrics: Map<string, QueueMetrics[]>;
  private monitoring: RedisMonitoringService;
  private config: MetricsConfig;
  private collectInterval?: NodeJS.Timeout;

  constructor(
    monitoring: RedisMonitoringService,
    config: Partial<MetricsConfig> = {}
  ) {
    super();
    this.queues = new Map();
    this.metrics = new Map();
    this.monitoring = monitoring;
    this.config = {
      collectInterval: config.collectInterval || 5000, // 5 secondes
      retentionPeriod: config.retentionPeriod || 3600000, // 1 heure
      samplingRate: config.samplingRate || 1 // 1 mesure par intervalle
    };
  }

  public async trackQueue(queue: Queue): Promise<void> {
    this.queues.set(queue.name, queue);
    this.metrics.set(queue.name, []);
    this.emit('queue-tracked', { queueName: queue.name });
  }

  public async startTracking(): Promise<void> {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
    }

    // Collecter immédiatement les premières métriques
    await this.collectMetrics();

    // Planifier les collectes suivantes
    this.collectInterval = setInterval(
      () => this.collectMetrics(),
      this.config.collectInterval
    );

    this.emit('tracking-started', {
      interval: this.config.collectInterval,
      timestamp: Date.now()
    });
  }

  public async stopTracking(): Promise<void> {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = undefined;
      this.emit('tracking-stopped', { timestamp: Date.now() });
    }
  }

  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();

    for (const [queueName, queue] of this.queues.entries()) {
      try {
        // Récupérer les compteurs de jobs
        const counts = await queue.getJobCounts();
        
        // Calculer les métriques de performance
        const performanceMetrics = await this.calculateQueueMetrics(queue, counts);
        
        // Stocker les métriques
        const metrics: QueueMetrics = {
          processed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
          active: counts.active || 0,
          waiting: counts.waiting || 0,
          completed: counts.completed || 0,
          throughput: performanceMetrics.throughput || 0,
          latency: performanceMetrics.latency || 0,
          errorRate: performanceMetrics.errorRate || 0,
          timestamp: Date.now()
        };

        this.storeMetrics(queueName, metrics);

        this.emit('metrics-collected', {
          queueName,
          metrics
        });
      } catch (error) {
        this.emit('metrics-error', {
          queueName,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp
        });
      }
    }

    // Nettoyer les anciennes métriques
    this.cleanOldMetrics();
  }

  private async calculateQueueMetrics(
    queue: Queue,
    counts: Record<string, number>
  ): Promise<Partial<QueueMetrics>> {
    const metrics: Partial<QueueMetrics> = {};

    // Calculer le débit (jobs traités par seconde)
    const completedJobs = await queue.getJobs(['completed'], 0, 100);
    const recentJobs = completedJobs.filter(
      job => (job.finishedOn || 0) > Date.now() - 60000
    );
    metrics.throughput = recentJobs.length / 60;

    // Calculer la latence moyenne
    const activeJobs = await queue.getJobs(['active']);
    const latencies = activeJobs.map(job => Date.now() - (job.processedOn || Date.now()));
    metrics.latency = latencies.length > 0
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
      : 0;

    // Calculer le taux d'erreur
    const total = counts.completed + counts.failed;
    metrics.errorRate = total > 0 ? (counts.failed / total) * 100 : 0;

    return metrics;
  }

  private storeMetrics(queueName: string, metrics: QueueMetrics): void {
    const queueMetrics = this.metrics.get(queueName) || [];
    queueMetrics.push(metrics);
    this.metrics.set(queueName, queueMetrics);
  }

  private cleanOldMetrics(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;

    for (const [queueName, queueMetrics] of this.metrics.entries()) {
      const filteredMetrics = queueMetrics.filter(
        metric => metric.timestamp > cutoff
      );
      this.metrics.set(queueName, filteredMetrics);
    }
  }

  public getMetrics(queueName: string, duration?: number): QueueMetrics[] {
    const queueMetrics = this.metrics.get(queueName) || [];
    if (!duration) return queueMetrics;

    const cutoff = Date.now() - duration;
    return queueMetrics.filter(metric => metric.timestamp > cutoff);
  }

  public getLatestMetrics(queueName: string): QueueMetrics | null {
    const queueMetrics = this.metrics.get(queueName) || [];
    return queueMetrics[queueMetrics.length - 1] || null;
  }

  public getAggregatedMetrics(queueName: string, duration: number): QueueMetrics | null {
    const metrics = this.getMetrics(queueName, duration);
    if (metrics.length === 0) return null;

    return {
      processed: this.average(metrics.map(m => m.processed)),
      failed: this.average(metrics.map(m => m.failed)),
      delayed: this.average(metrics.map(m => m.delayed)),
      active: this.average(metrics.map(m => m.active)),
      waiting: this.average(metrics.map(m => m.waiting)),
      completed: this.average(metrics.map(m => m.completed)),
      throughput: this.average(metrics.map(m => m.throughput)),
      latency: this.average(metrics.map(m => m.latency)),
      errorRate: this.average(metrics.map(m => m.errorRate)),
      timestamp: Date.now()
    };
  }

  private average(values: number[]): number {
    return values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  }
} 