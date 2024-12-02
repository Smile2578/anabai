// app/api/admin/monitoring/redis/route.ts
import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { RedisMonitoringService } from '@/lib/services/core/RedisMonitoringService';
import { ioRedisClient } from '@/lib/queue/config/redis';

const monitoringService = new RedisMonitoringService(ioRedisClient);

export const GET = protectApiRoute(async () => {
  try {
    const info = await monitoringService.getInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error in GET /api/admin/monitoring/redis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations Redis' },
      { status: 500 }
    );
  }
});