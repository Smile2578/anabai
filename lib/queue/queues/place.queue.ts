import { Job } from 'bullmq';
import { PlaceJobData, BaseJobResult } from '../types/queue.types';
import { BaseQueueService } from '../services/BaseQueueService';

export class PlaceQueueService extends BaseQueueService<PlaceJobData, BaseJobResult> {
  constructor() {
    super('place', async (job: Job<PlaceJobData, BaseJobResult>) => {
      const { placeId, action } = job.data;
      
      switch (action) {
        case 'enrich':
          return {
            success: true,
            message: `Lieu ${placeId} enrichi avec succès`,
            data: { placeId, enriched: true }
          };
        case 'validate':
          return {
            success: true,
            message: `Lieu ${placeId} validé avec succès`,
            data: { placeId, validated: true }
          };
        case 'update-info':
          return {
            success: true,
            message: `Informations du lieu ${placeId} mises à jour avec succès`,
            data: { placeId, updated: true }
          };
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    });
  }

  async addEnrichJob(
    placeId: string, 
    userId: string, 
    options?: { forceUpdate?: boolean }
  ): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('enrich', {
      placeId,
      userId,
      action: 'enrich',
      options
    });
  }

  async addValidateJob(
    placeId: string,
    userId: string
  ): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('validate', {
      placeId,
      userId,
      action: 'validate'
    });
  }

  async addUpdateJob(
    placeId: string,
    userId: string,
    options?: { validateOnly?: boolean }
  ): Promise<Job<PlaceJobData, BaseJobResult>> {
    return this.addJob('update-info', {
      placeId,
      userId,
      action: 'update-info',
      options
    });
  }
}

export const placeQueue = new PlaceQueueService(); 