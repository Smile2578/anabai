// app/api/admin/monitoring/metrics/route.ts
import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueMetricsService } from '@/lib/services/core/QueueMetricsService';
import { RedisMonitoringService } from '@/lib/services/core/RedisMonitoringService';
import { ioRedisClient } from '@/lib/queue/config/redis';

const monitoring = new RedisMonitoringService(ioRedisClient);
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