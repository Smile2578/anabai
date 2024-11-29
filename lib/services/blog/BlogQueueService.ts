import { Job } from 'bullmq';
import { blogQueue } from '@/lib/queue/queues/blog.queue';
import type { BlogJobData, BlogJobResult } from '@/lib/queue/types/blog.types';

export class BlogQueueService {
  static async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return blogQueue.add('publish', {
      postId,
      userId,
      action: 'publish'
    });
  }

  static async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return blogQueue.add('unpublish', {
      postId,
      userId,
      action: 'unpublish'
    });
  }

  static async schedulePublication(
    postId: string,
    userId: string,
    scheduledDate: Date
  ): Promise<Job<BlogJobData, BlogJobResult>> {
    return blogQueue.add(
      'schedule',
      {
        postId,
        userId,
        action: 'schedule',
        scheduledDate
      },
      {
        delay: scheduledDate.getTime() - Date.now()
      }
    );
  }

  static async processImages(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return blogQueue.add('process-images', {
      postId,
      userId,
      action: 'process-images'
    });
  }

  static async getJobStatus(jobId: string) {
    const job = await blogQueue.getJob(jobId);
    if (!job) {
      throw new Error('Job non trouvé');
    }

    const state = await job.getState();
    
    return {
      id: job.id,
      state,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp
    };
  }

  static async getPendingJobs() {
    return blogQueue.getWaiting();
  }

  static async getActiveJobs() {
    return blogQueue.getActive();
  }

  static async getCompletedJobs() {
    return blogQueue.getCompleted();
  }

  static async getFailedJobs() {
    return blogQueue.getFailed();
  }

  static async cleanOldJobs(grace: number = 24 * 3600 * 1000) { // 24h par défaut
    await blogQueue.clean(grace, 0); // 0 = completed jobs
    await blogQueue.clean(grace, 2); // 2 = failed jobs
  }
} 