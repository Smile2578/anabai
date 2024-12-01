import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueErrorHandlingService } from '@/lib/services/core/QueueErrorHandlingService';
import { RedisMonitoringService } from '@/lib/services/core/RedisMonitoringService';
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  reconnectOnError: (err) => err.message.includes('READONLY')
});

const monitoring = new RedisMonitoringService(redis);
const errorHandler = new QueueErrorHandlingService(monitoring, {
  maxRetries: 3,
  backoffDelay: 1000,
  alertThreshold: 10,
  monitoringEnabled: true
});

export const GET = protectApiRoute(async () => {
  try {
    const stats = errorHandler.getErrorStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/admin/monitoring/errors:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques d\'erreurs' },
      { status: 500 }
    );
  }
}); 