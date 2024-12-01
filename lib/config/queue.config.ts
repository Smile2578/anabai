import { QueueOptions } from 'bullmq';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: boolean;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  connectTimeout?: number;
}

export interface QueueConfig {
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
    removeOnComplete: boolean | number;
    removeOnFail: boolean | number;
  };
  settings: {
    maxStalledCount: number;
    stalledInterval: number;
    maxConcurrency: number;
  };
}

export interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    collectInterval: number;
    retentionPeriod: number;
  };
  alerts: {
    enabled: boolean;
    errorThreshold: number;
    errorTimeWindow: number;
  };
}

const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 5000
  } as RedisConfig,

  queues: {
    blog: {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 100
      },
      settings: {
        maxStalledCount: 2,
        stalledInterval: 30000,
        maxConcurrency: 3
      }
    },
    image: {
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 50,
        removeOnFail: 100
      },
      settings: {
        maxStalledCount: 3,
        stalledInterval: 45000,
        maxConcurrency: 2
      }
    },
    import: {
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000
        },
        removeOnComplete: 20,
        removeOnFail: 50
      },
      settings: {
        maxStalledCount: 1,
        stalledInterval: 60000,
        maxConcurrency: 1
      }
    },
    place: {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 100
      },
      settings: {
        maxStalledCount: 2,
        stalledInterval: 30000,
        maxConcurrency: 2
      }
    }
  } as Record<string, QueueConfig>,

  monitoring: {
    metrics: {
      enabled: true,
      collectInterval: 5000,
      retentionPeriod: 86400000 // 24 heures
    },
    alerts: {
      enabled: true,
      errorThreshold: 10,
      errorTimeWindow: 3600000 // 1 heure
    }
  } as MonitoringConfig
};

export const getQueueConfig = (queueName: string): QueueOptions => {
  const queueConfig = config.queues[queueName];
  if (!queueConfig) {
    throw new Error(`Configuration non trouvée pour la file d'attente: ${queueName}`);
  }

  return {
    connection: config.redis,
    defaultJobOptions: queueConfig.defaultJobOptions,
    ...queueConfig.settings
  };
};

export const getRedisConfig = (): RedisConfig => config.redis;
export const getMonitoringConfig = (): MonitoringConfig => config.monitoring; 