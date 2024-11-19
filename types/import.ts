// types/import.ts
import { Place } from './places/main';

export interface ImportPreview {
  original: {
    Title: string;
    Note?: string;
    URL?: string;
    Comment?: string;
  };
  status: 'pending' | 'success' | 'error';
  enriched?: {
    success: boolean;
    place?: Place;
    error?: string;
    placeId?: string;
  };
  validationErrors?: string[];  // Ajout du champ validationErrors
  existingPlace?: Place | null;  // Pour gérer les doublons
}

export interface ImportProgress {
  currentStep: number;
  totalSteps: number;
  label: string;
  subLabel?: string;
  progress: {
    current: number;
    total: number;
  };
  status: ImportStatus;
}

export type ImportStatus = 'processing' | 'success' | 'error';