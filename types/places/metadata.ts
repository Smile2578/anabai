// types/places/metadata.ts
import { Status } from '../common';

export interface PlaceMetadata {
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
  status: Status;
  tags?: string[];
  businessStatus?: string;
  rating?: number;
  ratingCount?: number;
  userRatingsTotal?: number;
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
}