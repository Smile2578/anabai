// types/form.ts
import * as z from 'zod';
import { Place } from './places/main';

export const placeFormSchema = z.object({
  name: z.object({
    fr: z.string().min(1, "Le nom en français est requis"),
    ja: z.string().optional(),
    en: z.string().optional(),
  }),

  location: z.object({
    point: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }),
    address: z.object({
      full: z.object({
        fr: z.string().min(1, "L'adresse en français est requise"),
        ja: z.string().optional(),
        en: z.string().optional(),
      }),
      prefecture: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      formatted: z.object({
        fr: z.string().optional(),
        ja: z.string().optional(),
        en: z.string().optional(),
      }).optional(),
    }),
    access: z.object({
      nearestStation: z.string().optional(),
      walkingTime: z.number().min(0).optional(),
      transportOptions: z.array(z.string()).optional(),
    }).optional(),
  }),

  category: z.enum(['Restaurant', 'Hôtel', 'Visite', 'Shopping', 'Café & Bar']),
  subcategories: z.array(z.string()),

  description: z.object({
    fr: z.string().optional(),
    ja: z.string().optional(),
    en: z.string().optional(),
  }).optional(),

  images: z.array(z.object({
    url: z.string().url("L'URL de l'image est invalide"),
    source: z.string(),
    isCover: z.boolean().optional(),
    caption: z.object({
      fr: z.string().optional(),
      ja: z.string().optional(),
      en: z.string().optional(),
    }).optional(),
    name: z.string().max(10, "Le nom interne doit faire maximum 10 caractères").optional(),
  })),

  pricing: z.object({
    level: z.number().min(1).max(4),
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default('JPY'),
    }).optional(),
    details: z.object({
      fr: z.string(),
      ja: z.string().optional(),
      en: z.string().optional(),
    }).optional(),
  }),

  openingHours: z.object({
    periods: z.array(z.object({
      day: z.number().min(0).max(6),
      open: z.string(),
      close: z.string(),
    })).optional(),
    weekdayTexts: z.object({
      fr: z.array(z.string()),
      ja: z.array(z.string()).optional(),
      en: z.array(z.string()).optional(),
    }),
    holidayDates: z.array(z.date()).optional(),
  }).optional(),

  contact: z.object({
    phone: z.string().optional(),
    website: z.string().url().optional(),
    bookingUrl: z.string().url().optional(),
    googleMapsUrl: z.string().url().optional(),
    socialMedia: z.record(z.string()).optional(),
  }).optional(),

  metadata: z.object({
    source: z.string(),
    placeId: z.string().optional(),
    status: z.enum(['brouillon', 'publié', 'archivé']).default('brouillon'),
    tags: z.array(z.string()).optional(),
    businessStatus: z.string().optional(),
  }),

  isActive: z.boolean().default(true),
});

export type PlaceFormData = z.infer<typeof placeFormSchema>;

// Types pour la validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface EnrichmentResult {
  success: boolean;
  data?: Partial<Place>;
  error?: string;
}

// Types pour les composants de formulaire
export interface FormFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{
    value: string;
    label: string;
  }>;
  multiple?: boolean;
}

export interface FileFieldProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload?: (files: File[]) => Promise<string[]>;
}