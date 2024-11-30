import { Job } from 'bullmq';
import { BaseQueueService } from '@/lib/queue/services/BaseQueueService';
import { BlogJobData, BaseJobResult } from '@/lib/queue/types/queue.types';

export class BlogQueueService extends BaseQueueService<BlogJobData, BaseJobResult> {
  constructor() {
    super('blog-queue', async (job: Job<BlogJobData, BaseJobResult>) => {
      return this.processBlogJob(job);
    });
  }

  public async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('publish-post', {
      action: 'publish',
      postId,
      userId
    });
  }

  public async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('unpublish-post', {
      action: 'unpublish',
      postId,
      userId
    });
  }

  public async addScheduleJob(
    postId: string,
    userId: string,
    scheduledDate: Date
  ): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('schedule-post', {
      action: 'schedule',
      postId,
      userId,
      scheduledDate
    });
  }

  public async addProcessImagesJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('process-post-images', {
      action: 'process-images',
      postId,
      userId
    });
  }

  private async processBlogJob(job: Job<BlogJobData, BaseJobResult>): Promise<BaseJobResult> {
    try {
      const { action, postId } = job.data;

      switch (action) {
        case 'publish':
          return await this.publishPost(postId);
        case 'unpublish':
          return await this.unpublishPost(postId);
        case 'schedule':
          return await this.schedulePost(postId, job.data.scheduledDate);
        case 'process-images':
          return await this.processPostImages(postId);
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
          error,
        };
      }
      return {
        success: false,
        message: 'Une erreur inconnue est survenue',
      };
    }
  }

  private async publishPost(postId: string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `Article ${postId} publié avec succès`,
      data: { postId, published: true },
    };
  }

  private async unpublishPost(postId: string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: `Article ${postId} dépublié avec succès`,
      data: { postId, unpublished: true },
    };
  }

  private async schedulePost(postId: string, scheduledDate?: Date | string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const formattedDate = scheduledDate instanceof Date ? scheduledDate.toISOString() : scheduledDate;
    return {
      success: true,
      message: `Publication de l'article ${postId} planifiée pour ${formattedDate}`,
      data: { postId, scheduled: true, scheduledDate: formattedDate },
    };
  }

  private async processPostImages(postId: string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      success: true,
      message: `Images de l'article ${postId} traitées avec succès`,
      data: { postId, imagesProcessed: true },
    };
  }

  public async getJobStatus(jobId: string): Promise<{
    id: string;
    state: string;
    data: BlogJobData;
    returnvalue?: BaseJobResult;
    failedReason?: string;
    timestamp?: number;
  }> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error('Job non trouvé');
    }

    const state = await job.getState();
    
    return {
      id: job.id as string,
      state,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp
    };
  }
} 