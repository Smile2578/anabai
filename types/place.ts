// types/place.ts
import { Types } from 'mongoose';

// Type de base pour un lieu sans _id
export interface PlaceBase {
  originalData?: {
    title?: string;
    note?: string;
    url?: string;
    comment?: string;
  };
  
  name: {
    ja: string;
    en: string;
    fr?: string;
  };
  
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: {
      ja: string;
      en: string;
      fr?: string;
      prefecture?: string;
      city?: string;
      postalCode?: string;
    };
    accessInfo?: {
      nearestStation: string;
      walkingTime: number;
      transportOptions?: string[];
    };
  };
  
  category: 'Restaurant' | 'Hôtel' | 'Visite' | 'Shopping' | 'Café & Bar';
  subcategories: string[];
  
  description: {
    ja?: string;
    en: string;
    fr?: string;
  };
  
  images: Array<{
    url: string;
    source: string;
    isCover?: boolean;
    caption?: {
      ja?: string;
      en?: string;
      fr?: string;
    };
  }>;
  
  openingHours: {
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
    weekdayText: {
      ja: string[];
      en: string[];
      fr: string[];
    };
    holidayDates?: Date[];
  };
  
  pricing?: {
    priceRange?: 1 | 2 | 3 | 4;
    currency: string;
    details?: {
      ja?: string;
      en?: string;
      fr?: string;
    };
    budget?: {
      min: number;
      max: number;
    };
  };
  
  contact?: {
    phone?: string;
    website?: string;
    bookingUrl?: string;
    socialMedia?: Map<string, string>;
  };
  
  ratings?: {
    googleRating?: number;
    googleReviewsCount?: number;
    internalRating?: number;
    internalReviewsCount?: number;
  };

  metadata: {
    source: string;
    placeId?: string;
    lastEnriched?: Date | string;
    lastVerified?: Date | string;
    verifiedBy?: string;
    status: 'brouillon' | 'publié' | 'archivé';
    tags?: string[];
    relatedPlaces?: Array<{
      placeId: Types.ObjectId | string;
      relationType: 'parent' | 'enfant' | 'proche';
    }>;
  };
  
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Type pour le document Mongoose
export interface PlaceDocument extends Omit<PlaceBase, 'metadata' | 'createdAt' | 'updatedAt'> {
  _id: Types.ObjectId;
  metadata: {
    source: string;
    placeId?: string;
    lastEnriched?: Date;
    lastVerified?: Date;
    verifiedBy?: string;
    status: 'brouillon' | 'publié' | 'archivé';
    tags?: string[];
    relatedPlaces?: Array<{
      placeId: Types.ObjectId;
      relationType: 'parent' | 'enfant' | 'proche';
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Type pour l'utilisation dans les composants
export interface Place extends Omit<PlaceBase, 'metadata' | 'createdAt' | 'updatedAt'> {
  _id: string;
  metadata: {
    source: string;
    placeId?: string;
    lastEnriched?: string;
    lastVerified?: string;
    verifiedBy?: string;
    status: 'brouillon' | 'publié' | 'archivé';
    tags?: string[];
    relatedPlaces?: Array<{
      placeId: string;
      relationType: 'parent' | 'enfant' | 'proche';
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

// Types utilitaires pour l'import CSV
export interface CSVPlace {
  Title: string;
  Note?: string;
  URL?: string;
  Comment?: string;
}

export interface EnrichmentResult {
  success: boolean;
  place?: Partial<Place>;
  error?: string;
  placeId?: string;
}

export interface ImportPreview {
  original: CSVPlace;
  enriched?: EnrichmentResult;
  status: 'pending' | 'success' | 'error';
}