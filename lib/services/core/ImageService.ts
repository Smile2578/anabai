// lib/services/core/ImageService.ts
import { Queue } from 'bullmq';
import sharp from 'sharp';
import { redisConfig } from '@/lib/queue/config/redis';
import { logger } from '@/lib/logger';
import { StorageService } from '../places/StorageService';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { LocationService } from './LocationService';
import { ValidationService } from '../places/ValidationService';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export class ImageService {
  private queue: Queue;
  private storage: StorageService;

  constructor() {
    this.queue = new Queue('image', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });
    const placeRepository = new PlaceRepository();
    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);
    this.storage = new StorageService(placeRepository, validationService);
  }

  async processImage(
    imageBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    try {
      let processor = sharp(imageBuffer);

      if (options.width || options.height) {
        processor = processor.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      if (options.format) {
        processor = processor.toFormat(options.format, {
          quality: options.quality || 80
        });
      }

      return await processor.toBuffer();
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  async getImageMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length
      };
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      throw new Error('Failed to get image metadata');
    }
  }

  async optimizeImage(
    imageBuffer: Buffer,
    targetSize: number = 800 * 1024 // 800KB par défaut
  ): Promise<Buffer> {
    try {
      let quality = 80;
      let optimizedBuffer = await this.processImage(imageBuffer, {
        format: 'webp',
        quality
      });

      while (optimizedBuffer.length > targetSize && quality > 20) {
        quality -= 10;
        optimizedBuffer = await this.processImage(imageBuffer, {
          format: 'webp',
          quality
        });
      }

      return optimizedBuffer;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw new Error('Failed to optimize image');
    }
  }

  async queueImageProcessing(
    imageId: string,
    options: ImageProcessingOptions
  ): Promise<void> {
    try {
      await this.queue.add(
        'process-image',
        {
          imageId,
          options
        },
        {
          jobId: `img-${imageId}`,
          removeOnComplete: true,
          removeOnFail: false
        }
      );
      logger.info(`Image processing job queued for image ${imageId}`);
    } catch (error) {
      logger.error('Error queuing image processing job:', error);
      throw new Error('Failed to queue image processing');
    }
  }

  async uploadImage(
    imageBuffer: Buffer,
    path: string,
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    try {
      const processedBuffer = await this.processImage(imageBuffer, options);
      const url = await this.storage.uploadFile(processedBuffer, path);
      return url;
    } catch (error) {
      logger.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      await this.storage.deleteFile(path);
      logger.info(`Image deleted successfully: ${path}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async cacheImage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const imageBuffer = await response.arrayBuffer();
      const processedImage = await this.processImage(Buffer.from(imageBuffer));
      const uploadedUrl = await this.uploadImage(processedImage, `cache/images/${Date.now()}.webp`);
      return uploadedUrl;
    } catch (error) {
      logger.error('Error caching image:', error);
      throw new Error('Failed to cache image');
    }
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

export const imageService = new ImageService();