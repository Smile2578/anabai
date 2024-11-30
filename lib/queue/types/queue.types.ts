// lib/queue/types/queue.types.ts
import { ConnectionOptions } from 'bullmq';

export interface BaseJobData {
  userId: string;
  createdAt?: Date;
}

export interface BaseJobResult {
  success: boolean;
  message?: string;
  error?: Error;
  data?: Record<string, unknown>;
}

export interface QueueConfig {
  redis: ConnectionOptions;
  defaultJobOptions?: {
    attempts?: number;
    backoff?: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
    removeOnComplete?: boolean | number | { count: number; age?: number };
    removeOnFail?: boolean | number | { count: number; age?: number };
  };
}

// Types pour les jobs de traitement d'images
export interface ImageProcessingJobData extends BaseJobData {
  action: 'optimize' | 'resize' | 'generate-og' | 'cleanup';
  imageUrl: string;
  targetSizes?: number[];
  quality?: number;
  format?: 'jpeg' | 'webp' | 'avif';
}

// Types pour les jobs d'import
export interface ImportJobData extends BaseJobData {
  type: 'csv' | 'google-places' | 'validation';
  fileContent?: string;
  filePath?: string;
  placeIds?: string[];
  options?: {
    skipValidation?: boolean;
    autoEnrich?: boolean;
    validateOnly?: boolean;
  };
}

// Types pour les jobs de blog
export interface BlogJobData extends BaseJobData {
  action: 'publish' | 'unpublish' | 'schedule' | 'process-images' | 'generate-version';
  postId: string;
  scheduledDate?: Date;
  version?: number;
}

// Types pour les jobs de lieux
export interface PlaceJobData extends BaseJobData {
  action: 'enrich' | 'validate' | 'update-info' | 'process-images';
  placeId: string;
  options?: {
    forceUpdate?: boolean;
    validateOnly?: boolean;
  };
}

export interface QueueOptions {
  removeOnComplete?: boolean | number | { count: number; age?: number };
  removeOnFail?: boolean | number | { count: number; age?: number };
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  priority?: number;
}


  