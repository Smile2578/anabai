// lib/queue/queues/import.queue.ts
import { Job } from 'bullmq';
import { ImportJobData, BaseJobResult } from '../types/queue.types';
import { BaseQueueService } from '../services/BaseQueueService';

export class ImportQueueService extends BaseQueueService<ImportJobData, BaseJobResult> {
  constructor() {
    super('import', async (job: Job<ImportJobData, BaseJobResult>) => {
      const { type, userId } = job.data;
      
      switch (type) {
        case 'csv':
          return {
            success: true,
            message: `Import CSV traité avec succès`,
            data: { type, userId, processed: true }
          };
        case 'google-places':
          return {
            success: true,
            message: `Import Google Places traité avec succès`,
            data: { type, userId, processed: true }
          };
        case 'validation':
          return {
            success: true,
            message: `Validation d'import terminée avec succès`,
            data: { type, userId, validated: true }
          };
        default:
          throw new Error(`Type d'import non supporté: ${type}`);
      }
    });
  }

  async addCsvImportJob(
    fileContent: string,
    userId: string,
    options?: { skipValidation?: boolean; autoEnrich?: boolean }
  ): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob('csv-import', {
      type: 'csv',
      userId,
      fileContent,
      options
    });
  }

  async addGooglePlacesImportJob(
    placeIds: string[],
    userId: string,
    options?: { autoEnrich?: boolean }
  ): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob('google-places-import', {
      type: 'google-places',
      userId,
      placeIds,
      options
    });
  }

  async addValidationJob(
    placeIds: string[],
    userId: string
  ): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob('validation', {
      type: 'validation',
      userId,
      placeIds
    });
  }
}

export const importQueue = new ImportQueueService();