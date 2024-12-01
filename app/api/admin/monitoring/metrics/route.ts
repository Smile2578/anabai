// app/api/admin/monitoring/metrics/route.ts
import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueMetricsService } from '@/lib/services/core/QueueMetricsService';
import { RedisMonitoringService } from '@/lib/services/core/RedisMonitoringService';
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 5000,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined
});

const monitoring = new RedisMonitoringService(redis);
const metricsService = new QueueMetricsService(monitoring, {
  collectInterval: 5000,
  retentionPeriod: 24 * 60 * 60 * 1000
});

export const GET = protectApiRoute(async () => {
  try {
    const metrics = metricsService.getMetrics('all');
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in GET /api/admin/monitoring/metrics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques' },
      { status: 500 }
    );
  }
});