import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Type pour les valeurs du formulaire, plus flexible que le type Place
export type PlaceFormValues = {
  name: {
    fr: string;
    ja?: string;
    en?: string;
  };
  location: {
    coordinates: [number, number];
    address: {
      fr: string;
      ja?: string;
      en?: string;
      prefecture?: string;
      city?: string;
      postalCode?: string;
    };
    accessInfo?: {
      nearestStation?: string;
      walkingTime?: number;
      transportOptions?: string[];
    };
  };
  category: string;
  subcategories: string[];
  description: {
    fr?: string;
    ja?: string;
    en?: string;
  };
  images: Array<{
    url: string;
    source: string;
    isCover?: boolean;
    caption?: {
      fr?: string;
      ja?: string;
      en?: string;
    };
  }>;
  openingHours?: {
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
    weekdayText: {
      fr: string[];
      ja: string[];
      en: string[];
    };
  };
  pricing?: {
    priceRange?: 1 | 2 | 3 | 4;
    currency?: string;
    details?: {
      fr?: string;
      ja?: string;
      en?: string;
    };
    budget?: {
      min?: number;
      max?: number;
    };
  };
  contact?: {
    phone?: string;
    website?: string;
    bookingUrl?: string;
  };
  metadata: {
    source: string;
    status: 'brouillon' | 'publié' | 'archivé';
    tags?: string[];
  };
};

// Props pour les composants de formulaire
export interface FormComponentProps {
  form: UseFormReturn<PlaceFormValues>;
}

// Schéma de validation Zod simplifié
export const placeFormSchema = z.object({
  name: z.object({
    fr: z.string().min(1, "Le nom en français est requis"),
    ja: z.string().optional(),
    en: z.string().optional()
  }),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.object({
      fr: z.string().min(1, "L'adresse en français est requise"),
      ja: z.string().optional(),
      en: z.string().optional()
    })
  }),
  category: z.string(),
  subcategories: z.array(z.string()),
  metadata: z.object({
    source: z.string(),
    status: z.enum(['brouillon', 'publié', 'archivé'])
  })
});