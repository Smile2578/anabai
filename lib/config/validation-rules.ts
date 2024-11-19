// lib/config/validation-rules.ts
import { Place } from '@/types/places/main';
import { PLACE_CATEGORIES } from './categories';

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
      bounds: {
        latitude: {
          min: 24.0,  // Okinawa
          max: 45.7   // Hokkaido
        },
        longitude: {
          min: 122.0, // Îles Yonaguni
          max: 154.0  // Îles Ogasawara
        }
      },
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
    minCount: 1,
    maxCount: 10,
    coverRequired: true,
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    dimensions: {
      minWidth: 800,
      minHeight: 600
    }
  },

  category: {
    required: true,
    values: Object.keys(PLACE_CATEGORIES)
  },

  pricing: {
    priceRange: {
      min: 1,
      max: 4
    },
    currency: {
      default: 'JPY'
    }
  },

  metadata: {
    required: ['source', 'status'],
    status: {
      values: ['brouillon', 'publié', 'archivé']
    }
  }
} as const;

// Fonctions utilitaires de validation
export const validatePlace = (place: Partial<Place>): string[] => {
  const errors: string[] = [];

  // Validation du nom
  if (!place.name?.fr || place.name.fr.length < VALIDATION_RULES.name.minLength) {
    errors.push('Le nom en français est requis');
  }
  if (!place.name?.ja && VALIDATION_RULES.name.required.ja) {
    errors.push('Le nom en japonais est requis');
  }
  // Validation de la localisation
  if (place.location?.point) {
    const { lng: longitude, lat: latitude } = place.location.point.coordinates;
    const { bounds } = VALIDATION_RULES.location.coordinates;
    
    if (latitude < bounds.latitude.min || latitude > bounds.latitude.max ||
        longitude < bounds.longitude.min || longitude > bounds.longitude.max) {
      errors.push('Les coordonnées doivent être situées au Japon');
    }
  } else if (VALIDATION_RULES.location.coordinates.required) {
    errors.push('Les coordonnées sont requises');
  }

  // Validation des images
  if (!place.images || place.images.length < VALIDATION_RULES.images.minCount) {
    errors.push(`Au moins ${VALIDATION_RULES.images.minCount} image est requise`);
  }
  if (place.images && !place.images.some(img => img.isCover)) {
    errors.push('Une image de couverture est requise');
  }

  // Validation de la catégorie
  if (!place.category || !VALIDATION_RULES.category.values.includes(place.category)) {
    errors.push('La catégorie est invalide');
  }

  return errors;
};

export const validateImage = (file: File): string[] => {
  const errors: string[] = [];
  
  if (file.size > VALIDATION_RULES.images.maxSize) {
    errors.push(`L'image ne doit pas dépasser ${VALIDATION_RULES.images.maxSize / 1024 / 1024}MB`);
  }
  const extension = file.name.split('.').pop()?.toLowerCase() as "jpg" | "jpeg" | "png" | "webp";
  if (!extension || !VALIDATION_RULES.images.formats.includes(extension)) {
    errors.push(`Format d'image non supporté. Formats acceptés : ${VALIDATION_RULES.images.formats.join(', ')}`);
  }

  return errors;
};