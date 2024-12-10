// lib/config/validation-rules.ts
import { Category, PLACE_CATEGORIES } from './categories';
import { GOOGLE_MAPS_CONFIG } from './google-maps';

export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: {
      fr: true,
      ja: true
    }
  },

  location: {
    coordinates: {
      bounds: GOOGLE_MAPS_CONFIG.geocoding.bounds,
      required: true
    },
    address: {
      required: {
        fr: true,
        ja: true
      },
      prefecture: {
        required: true
      },
      city: {
        required: true
      }
    }
  },

  images: {
    minCount: 0,
    maxCount: 10,
    coverRequired: false,
    formats: ['jpg', 'jpeg', 'png', 'webp'] as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    dimensions: {
      minWidth: 800,
      minHeight: 600
    }
  },

  category: {
    required: true,
    values: Object.keys(PLACE_CATEGORIES) as Category[],
    subcategories: {
      required: false,
      maxCount: 5
    }
  },

  pricing: {
    level: {
      min: 1,
      max: 4
    },
    currency: {
      default: 'JPY'
    }
  },
  metadata: {
    status: {
      values: ['publié', 'brouillon', 'archivé']
    }
  } 
} as const;

export type ValidationRules = typeof VALIDATION_RULES;