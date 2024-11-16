// types/place.ts
import { Types } from 'mongoose';

// Type de base pour un lieu sans _id
export interface PlaceBase {
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
    };
    accessInfo?: {
      nearestStation: string;
      walkingTime: number;
    };
  };
  category: string;
  subcategories: string[];
  description: {
    ja?: string;
    en: string;
    fr?: string;
  };
  images: string[];
  openingHours: {
    [key: string]: Array<{
      open: string;
      close: string;
    }>;
  };
  pricing?: {
    priceRange: 1 | 2 | 3 | 4;
    currency: string;
    details?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
    socialMedia?: Map<string, string>;
  };
  metadata: {
    source: string;
    lastUpdated: Date | string;
    verifiedBy?: string;
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
    lastUpdated: Date;
    verifiedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Type pour l'utilisation dans les composants
export interface Place extends Omit<PlaceBase, 'metadata' | 'createdAt' | 'updatedAt'> {
  _id: string;
  metadata: {
    source: string;
    lastUpdated: string;
    verifiedBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}