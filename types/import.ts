// types/import.ts
export type ImportStatus = 'processing' | 'success' | 'error';

export interface ImportProgressState {
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

// Pour l'étape d'import
export interface ImportStats {
  total: number;
  success: number;
  failed: number;
}

// Pour l'étape de validation
export interface ValidationStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
}