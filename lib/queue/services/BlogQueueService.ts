import { BaseQueueService } from './BaseQueueService'
import { BlogJobData, BaseJobResult } from '../types/queue.types'
import { redisConfig } from '../config/redis'
import { Job } from 'bullmq'

interface BlogJobResult extends BaseJobResult {
  data?: {
    postId: string;
    published?: boolean;
    unpublished?: boolean;
    scheduled?: boolean;
    scheduledDate?: string;
    imagesProcessed?: boolean;
  }
}

export class BlogQueueService extends BaseQueueService<BlogJobData, BlogJobResult> {
  constructor() {
    super('blog', async (job: Job<BlogJobData, BlogJobResult>) => {
      const { postId } = job.data
      
      switch (job.data.action) {
        case 'publish':
          return {
            success: true,
            message: `Article ${postId} publié avec succès`,
            data: { postId, published: true }
          }
        case 'unpublish':
          return {
            success: true,
            message: `Article ${postId} dépublié avec succès`,
            data: { postId, unpublished: true }
          }
        case 'schedule':
          const { scheduledDate } = job.data
          return {
            success: true,
            message: `Publication de l'article ${postId} planifiée pour ${scheduledDate}`,
            data: { postId, scheduled: true, scheduledDate: scheduledDate?.toISOString() }
          }
        case 'process-images':
          return {
            success: true,
            message: `Images de l'article ${postId} traitées avec succès`,
            data: { postId, imagesProcessed: true }
          }
        default:
          throw new Error(`Type de job inconnu: ${job.data.action}`)
      }
    }, {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    })
  }

  async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return await this.addJob('publish', {
      postId,
      userId,
      action: 'publish'
    })
  }

  async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return await this.addJob('unpublish', {
      postId,
      userId,
      action: 'unpublish'
    })
  }

  async addScheduleJob(postId: string, userId: string, scheduledDate: Date): Promise<Job<BlogJobData, BlogJobResult>> {
    return await this.addJob('schedule', { 
      postId,
      userId,
      action: 'schedule',
      scheduledDate
    })
  }

  async addProcessImagesJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return await this.addJob('process-images', {
      postId,
      userId,
      action: 'process-images'
    })
  }

  async getJobStatus(jobId: string): Promise<Job<BlogJobData, BlogJobResult> | undefined> {
    return await this.getJob(jobId)
  }
}

export const blogQueue = new BlogQueueService() 