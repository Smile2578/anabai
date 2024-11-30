import { Job } from 'bullmq';
import { BaseQueueService } from './BaseQueueService';
import { PlaceJobData, BaseJobResult } from '../types/queue.types';
import { ImageProcessingService } from './ImageProcessingService';

export class PlaceQueueService extends BaseQueueService<PlaceJobData, BaseJobResult> {
  private imageService: ImageProcessingService;

  constructor() {
    super('place-queue', async (job: Job<PlaceJobData, BaseJobResult>) => {
      return this.processPlaceJob(job);
    });
    this.imageService = new ImageProcessingService();
  }

  public async addEnrichJob(placeId: string, userId: string, options?: { forceUpdate?: boolean }): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('enrich-place', {
      action: 'enrich',
      placeId,
      userId,
      options
    });
  }

  public async addValidateJob(placeId: string, userId: string): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('validate-place', {
      action: 'validate',
      placeId,
      userId
    });
  }

  public async addUpdateJob(placeId: string, userId: string, options?: { validateOnly?: boolean }): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('update-place', {
      action: 'update-info',
      placeId,
      userId,
      options
    });
  }

  public async addProcessImagesJob(placeId: string, userId: string): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('process-place-images', {
      action: 'process-images',
      placeId,
      userId
    });
  }

  private async processPlaceJob(job: Job<PlaceJobData, BaseJobResult>): Promise<BaseJobResult> {
    try {
      const { action, placeId, options } = job.data;

      switch (action) {
        case 'enrich':
          return await this.enrichPlace(placeId, options);
        case 'validate':
          return await this.validatePlace(placeId);
        case 'update-info':
          return await this.updatePlaceInfo(placeId, options);
        case 'process-images':
          return await this.processPlaceImages(placeId);
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

  private async enrichPlace(placeId: string, options?: { forceUpdate?: boolean }): Promise<BaseJobResult> {
    // Simuler l'enrichissement d'un lieu
    await new Promise((resolve) => setTimeout(resolve, options?.forceUpdate ? 2000 : 1000));
    return {
      success: true,
      message: `Lieu ${placeId} enrichi avec succès${options?.forceUpdate ? ' (forcé)' : ''}`,
      data: { placeId, enriched: true, forceUpdate: options?.forceUpdate },
    };
  }

  private async validatePlace(placeId: string): Promise<BaseJobResult> {
    // Simuler la validation d'un lieu
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: `Lieu ${placeId} validé avec succès`,
      data: { placeId, validated: true },
    };
  }

  private async updatePlaceInfo(placeId: string, options?: { validateOnly?: boolean }): Promise<BaseJobResult> {
    // Simuler la mise à jour des informations d'un lieu
    await new Promise((resolve) => setTimeout(resolve, options?.validateOnly ? 400 : 800));
    return {
      success: true,
      message: `Informations du lieu ${placeId} ${options?.validateOnly ? 'validées' : 'mises à jour'}`,
      data: { placeId, updated: !options?.validateOnly, validated: options?.validateOnly },
    };
  }

  private async processPlaceImages(placeId: string): Promise<BaseJobResult> {
    // Simuler le traitement des images d'un lieu
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: `Images du lieu ${placeId} traitées avec succès`,
      data: { placeId, imagesProcessed: true },
    };
  }

  public async close(): Promise<void> {
    await super.close();
    await this.imageService.close();
  }
} 