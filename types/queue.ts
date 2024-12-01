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

export interface QueueJobData {
  id: string;
  queueName: string;
  status: 'active' | 'waiting' | 'completed' | 'failed';
  data: Record<string, unknown>;
  progress: number;
  attemptsMade: number;
  timestamp: string;
  failedReason?: string;
}

export interface QueueStats {
  completed: number;
  failed: number;
  delayed: number;
  active: number;
  waiting: number;
  throughput: number;
  latency: number;
  errorRate: number;
}

export interface RedisStats {
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  clients: {
    connected: number;
    blocked: number;
    maxClients: number;
  };
  stats: {
    totalConnections: number;
    totalCommands: number;
    opsPerSecond: number;
    hitRate: number;
  };
  server: {
    version: string;
    uptime: number;
  };
}

export interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  errorsByQueue: Record<string, number>;
  errorsByType: Record<string, number>;
  recentErrors: Array<{
    id: string;
    queueName: string;
    error: string;
    timestamp: string;
  }>;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
} 