import { Job } from 'bullmq';
import { BaseQueueService } from './BaseQueueService';
import { ImageProcessingJobData, BaseJobResult } from '../types/queue.types';

export class ImageProcessingService extends BaseQueueService<ImageProcessingJobData, BaseJobResult> {
  constructor() {
    super('image-processing-queue', async (job: Job<ImageProcessingJobData, BaseJobResult>) => {
      return this.processImageJob(job);
    });
  }

  public async addOptimizeJob(
    imageUrl: string, 
    userId: string, 
    options: { quality: number; format: 'jpeg' | 'webp' | 'avif' }
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('optimize-image', {
      action: 'optimize',
      imageUrl,
      userId,
      quality: options.quality,
      format: options.format
    });
  }

  public async addResizeJob(
    imageUrl: string,
    userId: string,
    targetSizes: number[]
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('resize-image', {
      action: 'resize',
      imageUrl,
      userId,
      targetSizes
    });
  }

  public async addGenerateOgJob(
    imageUrl: string,
    userId: string
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('generate-og-image', {
      action: 'generate-og',
      imageUrl,
      userId
    });
  }

  public async addCleanupJob(
    imageUrl: string,
    userId: string
  ): Promise<Job<ImageProcessingJobData, BaseJobResult>> {
    return this.addJob('cleanup-images', {
      action: 'cleanup',
      imageUrl,
      userId
    });
  }

  private async processImageJob(job: Job<ImageProcessingJobData, BaseJobResult>): Promise<BaseJobResult> {
    try {
      const { action, imageUrl } = job.data;

      switch (action) {
        case 'optimize':
          return await this.optimizeImage(imageUrl, job.data);
        case 'resize':
          return await this.resizeImage(imageUrl, job.data.targetSizes);
        case 'generate-og':
          return await this.generateOgImage(imageUrl);
        case 'cleanup':
          return await this.cleanupImages(imageUrl);
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

  private async optimizeImage(imageUrl: string, options: Partial<ImageProcessingJobData>): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `Image ${imageUrl} optimisée avec succès`,
      data: { imageUrl, optimized: true, ...options },
    };
  }

  private async resizeImage(imageUrl: string, targetSizes?: number[]): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: `Image ${imageUrl} redimensionnée avec succès`,
      data: { imageUrl, resized: true, targetSizes },
    };
  }

  private async generateOgImage(imageUrl: string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: `Image OG générée pour ${imageUrl}`,
      data: { imageUrl, ogGenerated: true },
    };
  }

  private async cleanupImages(imageUrl: string): Promise<BaseJobResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: `Images temporaires nettoyées pour ${imageUrl}`,
      data: { imageUrl, cleaned: true },
    };
  }
} 