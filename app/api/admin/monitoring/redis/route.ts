// app/api/admin/monitoring/redis/route.ts
import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
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

const monitoringService = new RedisMonitoringService(redis);

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