// types/google/responses.ts
import { GooglePlace } from './place';
import { GoogleLocation } from './base';

export interface GoogleSearchResponse {
  places: GooglePlace[];
  nextPageToken?: string;
}

export interface GoogleErrorDetail {
  type: string;
  reason?: string;
  domain?: string;
  metadata?: Record<string, string>;
}

export interface GoogleError {
  code: number;
  message: string;
  status: string;
  details?: GoogleErrorDetail[];
}

export interface GoogleSearchTextRequest {
  textQuery: string;
  languageCode?: string;
  maxResultCount?: number;
  locationBias?: {
    circle?: {
      center: GoogleLocation;
      radius: number;
    };
    rectangle?: {
      low: GoogleLocation;
      high: GoogleLocation;
    };
    locationRestriction?: boolean;
  };
}

export interface GooglePlaceDetailsRequest {
  placeId: string;
  languageCode?: string;
  regionCode?: string;
  sessionToken?: string;
}