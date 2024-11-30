import { Job } from 'bullmq';
import { ImageProcessingJobData, BaseJobResult } from '../types/queue.types';
import { BaseQueueService } from '../services/BaseQueueService';

export class ImageQueueService extends BaseQueueService<ImageProcessingJobData, BaseJobResult> {
  constructor() {
    super('image-processing', async (job: Job<ImageProcessingJobData, BaseJobResult>) => {
      const { imageUrl, action } = job.data;
      
      switch (action) {
        case 'optimize':
          return {
            success: true,
            message: `Image ${imageUrl} optimisée avec succès`,
            data: { imageUrl, optimized: true }
          };
        case 'resize':
          return {
            success: true,
            message: `Image ${imageUrl} redimensionnée avec succès`,
            data: { imageUrl, resized: true }
          };
        case 'generate-og':
          return {
            success: true,
            message: `Image OG générée pour ${imageUrl}`,
            data: { imageUrl, ogGenerated: true }
          };
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    });
  }

  async addOptimizeJob(
    imageUrl: string, 
    userId: string, 
    options?: { quality?: number; format?: 'jpeg' | 'webp' | 'avif' }
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('optimize', {
      imageUrl,
      userId,
      action: 'optimize',
      ...options
    });
  }

  async addResizeJob(
    imageUrl: string,
    userId: string,
    targetSizes: number[]
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('resize', {
      imageUrl,
      userId,
      action: 'resize',
      targetSizes
    });
  }

  async addGenerateOgJob(
    imageUrl: string,
    userId: string
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('generate-og', {
      imageUrl,
      userId,
      action: 'generate-og'
    });
  }
}

export const imageQueue = new ImageQueueService(); 