// types/places/metadata.ts
import { Status } from '../common';

export interface PlaceMetadata {
  status: Status;
  source: string;
  authors?: {
    id: string;
    name: string;
    role: 'admin' | 'editor';
    addedAt: Date;
  }[];
  placeId?: string;
  lastEnriched?: Date;
  lastVerified?: Date;
  verifiedBy?: string;
  tags?: string[];
  businessStatus?: string;
  rating?: number;
  ratingCount?: number;
  userRatingsTotal?: number;
  visitCount?: number;
  seasonality?: {
    bestMonths?: number[];
    peakHours?: Record<string, string[]>;
    specialEvents?: Array<{
      name: string;
      startDate: Date;
      endDate: Date;
      description?: string;
    }>;
  };
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
  createdAt?: Date;
  createdBy?: string;
}