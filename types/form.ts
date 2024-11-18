import * as z from 'zod';
import { UseFormReturn } from 'react-hook-form';

export const placeFormSchema = z.object({
  name: z.object({
    fr: z.string().min(1, "Le nom en français est requis"),
    ja: z.string().optional(),
  }),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.object({
      fr: z.string().min(1, "L'adresse en français est requise"),
      ja: z.string().optional(),
      prefecture: z.string().optional(),
      city: z.string().optional(),
    }),
    accessInfo: z.object({
      nearestStation: z.string().optional(),
      walkingTime: z.number().min(0).optional(),
    }),
  }),
  category: z.enum(['Restaurant', 'Hôtel', 'Visite', 'Shopping', 'Café & Bar']),
  subcategories: z.array(z.string()),
  description: z.object({
    fr: z.string().optional(),
  }),
  images: z.array(z.object({
    url: z.string(),
    source: z.string(),
    isCover: z.boolean().optional(),
    caption: z.object({
      fr: z.string().optional(),
    }).optional(),
  })),
  openingHours: z.object({
    periods: z.array(z.object({
      day: z.number(),
      open: z.string(),
      close: z.string(),
    })),
    weekdayText: z.object({
      ja: z.array(z.string()),
      fr: z.array(z.string()),
    }),
  }),
  pricing: z.object({
    priceRange: z.number().min(1).max(4).optional(),
    currency: z.string().default('JPY'),
    budget: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
  }),
  contact: z.object({
    phone: z.string().optional(),
    website: z.string().url().optional(),
    bookingUrl: z.string().url().optional(),
  }),
  ratings: z.object({
    googleRating: z.number().min(0).max(5).optional(),
    googleReviewsCount: z.number().min(0).optional(),
  }).optional(),
  metadata: z.object({
    source: z.string(),
    placeId: z.string().optional(),
    lastEnriched: z.string().optional(),
    status: z.enum(['brouillon', 'publié', 'archivé']).default('publié'),
  }).optional(),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

export interface FormComponentProps {
  form: UseFormReturn<PlaceFormValues>;
}

// Types pour la validation et l'enrichissement
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EnrichmentResult {
  success: boolean;
  data?: Partial<PlaceFormValues>;
  error?: string;
}

// Types pour les statistiques d'import
export interface ImportStats {
  total: number;
  success: number;
  failed: number;
  duplicates: number;
}

// Types pour le statut de l'import
export type ImportStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ImportProgress {
  status: ImportStatus;
  message: string;
  current: number;
  total: number;
}