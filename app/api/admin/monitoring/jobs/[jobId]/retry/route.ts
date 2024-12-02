import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { QueueManagerService } from '@/lib/services/core/QueueManagerService';
import { ioRedisClient } from '@/lib/queue/config/redis';

const queueManager = new QueueManagerService({
  redis: ioRedisClient,
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