import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueErrorHandlingService } from '@/lib/services/core/QueueErrorHandlingService';
import { RedisMonitoringService } from '@/lib/services/core/RedisMonitoringService';
import { ioRedisClient } from '@/lib/queue/config/redis';

const monitoring = new RedisMonitoringService(ioRedisClient);
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