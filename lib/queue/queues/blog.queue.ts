import { Job } from 'bullmq';
import { BlogJobData, BaseJobResult } from '../types/queue.types';
import { BaseQueueService } from '../services/BaseQueueService';

export class BlogQueueService extends BaseQueueService<BlogJobData, BaseJobResult> {
  constructor() {
    super('blog', async (job: Job<BlogJobData, BaseJobResult>) => {
      const { postId, action } = job.data;
      
      switch (action) {
        case 'publish':
          return {
            success: true,
            message: `Article ${postId} publié avec succès`,
            data: { postId, published: true }
          };
        case 'unpublish':
          return {
            success: true,
            message: `Article ${postId} dépublié avec succès`,
            data: { postId, unpublished: true }
          };
        case 'schedule':
          return {
            success: true,
            message: `Publication de l'article ${postId} planifiée`,
            data: { postId, scheduled: true }
          };
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    });
  }

  async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('publish', {
      postId,
      userId,
      action: 'publish'
    });
  }

  async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('unpublish', {
      postId,
      userId,
      action: 'unpublish'
    });
  }

  async addScheduleJob(
    postId: string, 
    userId: string, 
    scheduledDate: Date
  ): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('schedule', {
      postId,
      userId,
      action: 'schedule',
      scheduledDate
    }, {
      delay: scheduledDate.getTime() - Date.now()
    });
  }
}

export const blogQueue = new BlogQueueService(); 