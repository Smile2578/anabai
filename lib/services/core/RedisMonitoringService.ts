import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

export interface RedisMetrics {
  connectedClients: number;
  usedMemory: number;
  usedMemoryPeak: number;
  totalCommands: number;
  totalConnections: number;
  uptime: number;
}

export class RedisMonitoringService extends EventEmitter {
  private redis: Redis;
  private metrics: RedisMetrics = {
    connectedClients: 0,
    usedMemory: 0,
    usedMemoryPeak: 0,
    totalCommands: 0,
    totalConnections: 0,
    uptime: 0
  };

  private healthCheckInterval!: NodeJS.Timeout;
  private metricsInterval!: NodeJS.Timeout;

  constructor(redis: Redis) {
    super();
    this.redis = redis;
    this.setupMonitoring();
  }

  private setupMonitoring(): void {
    // Health check toutes les 30 secondes
    this.healthCheckInterval = setInterval(async () => {
      try {
        const ping = await this.redis.ping();
        this.emit('health', ping === 'PONG');
      } catch (error) {
        this.emit('health', false);
        console.error('Redis health check failed:', error);
      }
    }, 30000);

    // Collecter les métriques toutes les minutes
    this.metricsInterval = setInterval(async () => {
      try {
        const info = await this.redis.info();
        this.updateMetrics(info);
      } catch (error) {
        console.error('Failed to collect Redis metrics:', error);
      }
    }, 60000);

    // Écouter les événements Redis
    this.redis.on('connect', () => this.emit('connect'));
    this.redis.on('error', (error) => this.emit('error', error));
    this.redis.on('close', () => this.emit('close'));
  }

  private updateMetrics(info: string): void {
    const metrics = info.split('\n').reduce((acc, line) => {
      const [key, value] = line.split(':');
      if (value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    this.metrics = {
      connectedClients: parseInt(metrics['connected_clients'] || '0'),
      usedMemory: parseInt(metrics['used_memory'] || '0'),
      usedMemoryPeak: parseInt(metrics['used_memory_peak'] || '0'),
      totalCommands: parseInt(metrics['total_commands_processed'] || '0'),
      totalConnections: parseInt(metrics['total_connections_received'] || '0'),
      uptime: parseInt(metrics['uptime_in_seconds'] || '0')
    };

    this.emit('metrics', this.metrics);
  }

  public getMetrics(): RedisMetrics {
    return { ...this.metrics };
  }

  public async getQueueSizes(): Promise<Record<string, number>> {
    const keys = await this.redis.keys('bull:*:waiting');
    const sizes: Record<string, number> = {};

    for (const key of keys) {
      const queueName = key.split(':')[1];
      sizes[queueName] = await this.redis.llen(key);
    }

    return sizes;
  }

  public stop(): void {
    clearInterval(this.healthCheckInterval);
    clearInterval(this.metricsInterval);
    this.removeAllListeners();
  }

  public async getInfo() {
    const info = await this.redis.info();
    const metrics = info.split('\n').reduce((acc, line) => {
      const [key, value] = line.split(':');
      if (value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    return {
      memory: {
        used: parseInt(metrics['used_memory'] || '0'),
        peak: parseInt(metrics['used_memory_peak'] || '0'),
        fragmentation: parseFloat(metrics['mem_fragmentation_ratio'] || '0')
      },
      clients: {
        connected: parseInt(metrics['connected_clients'] || '0'),
        blocked: parseInt(metrics['blocked_clients'] || '0'),
        maxClients: parseInt(metrics['maxclients'] || '0')
      },
      stats: {
        totalConnections: parseInt(metrics['total_connections_received'] || '0'),
        totalCommands: parseInt(metrics['total_commands_processed'] || '0'),
        opsPerSecond: parseInt(metrics['instantaneous_ops_per_sec'] || '0'),
        hitRate: parseFloat(metrics['keyspace_hits'] || '0') / 
          (parseFloat(metrics['keyspace_hits'] || '0') + parseFloat(metrics['keyspace_misses'] || '1'))
      },
      server: {
        version: metrics['redis_version'] || '',
        uptime: parseInt(metrics['uptime_in_seconds'] || '0')
      }
    };
  }
} 