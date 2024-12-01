import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueManagerService } from '@/lib/services/core/QueueManagerService';
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

const queueManager = new QueueManagerService({
  redis,
  maxRetries: 3,
  initialBackoff: 1000,
  concurrency: 5,
  maxStalledCount: 1,
  stalledInterval: 30000,
  cleanupInterval: 3600000,
  monitoringInterval: 5000
});

export const GET = protectApiRoute(async () => {
  try {
    const jobs = await queueManager.getAllJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error in GET /api/admin/monitoring/jobs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des jobs' },
      { status: 500 }
    );
  }
});

export const DELETE = protectApiRoute(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const queueName = searchParams.get('queueName');

    if (!jobId || !queueName) {
      return NextResponse.json(
        { error: 'jobId et queueName sont requis' },
        { status: 400 }
      );
    }

    await queueManager.deleteJob(queueName, jobId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/monitoring/jobs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du job' },
      { status: 500 }
    );
  }
}); 