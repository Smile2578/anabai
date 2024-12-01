import { Queue, Worker, Job } from 'bullmq';
import { getRedisConfig } from '../../config/queue.config';
import { BlogCacheService } from './BlogCacheService';

interface BlogJobData {
  postId: string;
  action: 'publish' | 'unpublish' | 'schedule' | 'process-images';
  scheduledDate?: string;
  userId: string;
}

interface BlogJobResult {
  success: boolean;
  message: string;
  data?: {
    postId: string;
    published?: boolean;
    unpublished?: boolean;
    scheduled?: boolean;
    scheduledDate?: string;
    imagesProcessed?: boolean;
  };
}

export class BlogQueueService {
  private queue: Queue<BlogJobData, BlogJobResult>;
  private worker: Worker<BlogJobData, BlogJobResult>;
  private cache: BlogCacheService;

  constructor() {
    this.cache = new BlogCacheService();
    
    this.queue = new Queue<BlogJobData, BlogJobResult>('blog', {
      connection: getRedisConfig(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          count: 1000,
          age: 24 * 3600,
        },
        removeOnFail: {
          count: 5000,
        },
      },
    });

    this.worker = new Worker<BlogJobData, BlogJobResult>(
      'blog',
      async (job: Job<BlogJobData, BlogJobResult>) => {
        const { postId, action, scheduledDate } = job.data;

        switch (action) {
          case 'publish':
            return this.handlePublish(postId);
          case 'unpublish':
            return this.handleUnpublish(postId);
          case 'schedule':
            return this.handleSchedule(postId, scheduledDate);
          case 'process-images':
            return this.handleImageProcessing(postId);
          default:
            throw new Error(`Action non supportée: ${action}`);
        }
      },
      {
        connection: getRedisConfig(),
        concurrency: 5,
        limiter: {
          max: 100,
          duration: 1000,
        },
      }
    );

    this.setupListeners();
  }

  private setupListeners(): void {
    this.worker.on('completed', async (job: Job<BlogJobData, BlogJobResult>) => {
      console.log(`Tâche ${job.id} terminée avec succès:`, job.returnvalue);
      
      // Invalider le cache si nécessaire
      if (job.data.action !== 'process-images') {
        await this.cache.invalidatePost(job.data.postId);
      }
    });

    this.worker.on('failed', (job: Job<BlogJobData, BlogJobResult> | undefined, error: Error) => {
      console.error(`Tâche ${job?.id} échouée:`, error);
    });
  }

  private async handlePublish(postId: string): Promise<BlogJobResult> {
    // Simuler la publication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Article ${postId} publié avec succès`,
      data: {
        postId,
        published: true,
      },
    };
  }

  private async handleUnpublish(postId: string): Promise<BlogJobResult> {
    // Simuler la dépublication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: `Article ${postId} dépublié avec succès`,
      data: {
        postId,
        unpublished: true,
      },
    };
  }

  private async handleSchedule(postId: string, scheduledDate?: string): Promise<BlogJobResult> {
    // Simuler la planification
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: `Publication de l'article ${postId} planifiée pour ${scheduledDate}`,
      data: {
        postId,
        scheduled: true,
        scheduledDate,
      },
    };
  }

  private async handleImageProcessing(postId: string): Promise<BlogJobResult> {
    // Simuler le traitement des images
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      message: `Images de l'article ${postId} traitées avec succès`,
      data: {
        postId,
        imagesProcessed: true,
      },
    };
  }

  public async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return this.queue.add('publish', {
      postId,
      userId,
      action: 'publish',
    });
  }

  public async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BlogJobResult>> {
    return this.queue.add('unpublish', {
      postId,
      userId,
      action: 'unpublish',
    });
  }

  public async addScheduleJob(
    postId: string,
    userId: string,
    scheduledDate: string
  ): Promise<Job<BlogJobData, BlogJobResult>> {
    return this.queue.add('schedule', {
      postId,
      userId,
      action: 'schedule',
      scheduledDate,
    }, {
      delay: new Date(scheduledDate).getTime() - Date.now(),
    });
  }

  public async addImageProcessingJob(
    postId: string,
    userId: string
  ): Promise<Job<BlogJobData, BlogJobResult>> {
    return this.queue.add('process-images', {
      postId,
      userId,
      action: 'process-images',
    }, {
      priority: 2, // Priorité plus élevée pour le traitement des images
    });
  }

  public async getJob(jobId: string): Promise<Job<BlogJobData, BlogJobResult> | undefined> {
    return this.queue.getJob(jobId);
  }

  public async close(): Promise<void> {
    await this.queue.close();
    await this.worker.close();
  }
} 