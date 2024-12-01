// types/import.ts
import { Place } from './places/main';

export type ImportErrorReason = 
  | 'MISSING_TITLE'
  | 'NOT_FOUND'
  | 'DETAILS_NOT_FOUND'
  | 'OUTSIDE_JAPAN'
  | 'PROCESSING_ERROR';

export interface ImportErrorDetails {
  reason: ImportErrorReason;
  message: string;
  searchQuery?: string;
  possibleReasons?: string[];
  placeId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  error?: string;
}

export interface ImportSuccessDetails {
  foundName: string;
  address: string;
  types: string[];
}

export interface ImportPreview {
  original: {
    Title: string;
    Note?: string;
    URL?: string;
    Comment?: string;
  };
  status: 'pending' | 'success' | 'error';
  enriched: {
    success: boolean;
    place?: Place;
    error?: string;
    placeId?: string;
    details?: ImportErrorDetails | ImportSuccessDetails;
  };
  validationErrors?: string[];
  existingPlace?: Place | null;
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