import { Job } from 'bullmq';
import { BaseQueueService } from './BaseQueueService';
import { ImportJobData, BaseJobResult, QueueOptions } from '../types/queue.types';
import path from 'path';
import fs from 'fs/promises';

export class ImportQueueService extends BaseQueueService<ImportJobData> {
  constructor() {
    super('import-queue', async (job: Job<ImportJobData, BaseJobResult>) => {
      return this.processJob(job);
    });
  }

  private async processJob(job: Job<ImportJobData, BaseJobResult>): Promise<BaseJobResult> {
    try {
      switch (job.data.type) {
        case 'csv':
          return await this.processCsvImport(job.data);
        case 'google-places':
          return await this.processGooglePlacesImport(job.data);
        case 'validation':
          return await this.processValidation(job.data);
        default:
          throw new Error(`Type de job non supporté: ${job.data.type}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
          error: error,
        };
      }
      return {
        success: false,
        message: 'Une erreur inconnue est survenue',
      };
    }
  }

  private async processCsvImport(data: ImportJobData): Promise<BaseJobResult> {
    if (!data.filePath) {
      throw new Error('Chemin du fichier CSV manquant');
    }

    try {
      await fs.access(data.filePath);
      // Simuler le traitement du CSV
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Import CSV réussi',
        data: {
          importedCount: 10,
          failedCount: 0,
        },
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'accès au fichier CSV: ${error}`);
    }
  }

  private async processGooglePlacesImport(data: ImportJobData): Promise<BaseJobResult> {
    if (!data.placeIds || data.placeIds.length === 0) {
      throw new Error('IDs Google Places manquants');
    }

    // Simuler l'import depuis Google Places
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      message: 'Import Google Places réussi',
      data: {
        importedCount: data.placeIds.length,
        failedCount: 0,
      },
    };
  }

  private async processValidation(data: ImportJobData): Promise<BaseJobResult> {
    if (!data.placeIds || data.placeIds.length === 0) {
      throw new Error('IDs de lieux manquants pour la validation');
    }

    // Simuler la validation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Validation réussie',
      data: {
        importedCount: data.placeIds.length,
        failedCount: 0,
      },
    };
  }

  public async importCsv(filePath: string, userId: string, options?: QueueOptions): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob(
      'csv-import',
      {
        type: 'csv',
        userId,
        filePath: path.resolve(filePath),
        createdAt: new Date(),
      },
      options
    );
  }

  public async importGooglePlaces(
    placeIds: string[],
    userId: string,
    options?: QueueOptions
  ): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob(
      'google-places-import',
      {
        type: 'google-places',
        userId,
        placeIds,
        createdAt: new Date(),
      },
      options
    );
  }

  public async validateImport(
    placeIds: string[],
    userId: string,
    options?: QueueOptions
  ): Promise<Job<ImportJobData, BaseJobResult>> {
    return this.addJob(
      'validate-import',
      {
        type: 'validation',
        userId,
        placeIds,
        createdAt: new Date(),
      },
      options
    );
  }
} 