// types/place.ts

import { Types } from 'mongoose';

export interface PlaceBase {
  originalData?: {
    title?: string;
    note?: string;
    url?: string;
    comment?: string;
  };
  
  name: {
    ja?: string;
    fr: string;
  };
  
  location: {
    type: 'Point';
    coordinates: [number, number];
    accessInfo?: {
      nearestStation?: string;
      walkingTime?: number;
    };
    address: {
      ja?: string;
      fr: string;
      prefecture?: string;
      city?: string;
      postalCode?: string;
    };
  };
  
  category: 'Restaurant' | 'Hôtel' | 'Visite' | 'Shopping' | 'Café & Bar';
  subcategories: string[];
  
  description: {
    ja?: string;
    fr: string;
  };
  
  images: Array<{
    url: string;
    source: string;
    isCover?: boolean;
    caption?: {
      ja?: string;
      fr?: string;
    };
  }>;
  
  openingHours?: {
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
    weekdayText: {
      ja?: string[];
      fr: string[];
    };
  };
  
  pricing?: {
    priceRange?: 1 | 2 | 3 | 4 | 5;
    currency: string;
  };
  
  contact?: {
    phone?: string;
    website?: string;
    googleMaps?: string;
  };
  
  metadata: {
    source: string;
    placeId?: string;
    status: 'brouillon' | 'publié' | 'archivé';
    rating?: number;
    userRatingsTotal?: number;
    businessStatus?: string;
  };

  rating: {
    googleRating?: number;
    googleReviewsCount?: number;
    internalRating?: number;
    internalReviewsCount?: number;
  }
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Place extends PlaceBase {
  _id: string;
}

export interface PlaceDocument extends Omit<PlaceBase, 'createdAt' | 'updatedAt'> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportPreview {
  original: {
    Title: string;
    Note?: string;
    URL?: string;
    Comment?: string;
  };
  enriched?: {
    success: boolean;
    place?: Place;
    error?: string;
    placeId?: string;
  };
  status: 'pending' | 'success' | 'error';
}

export interface CSVPlace {
  Title: string;
  Note?: string;
  URL?: string;
  Comment?: string;
}