// types/places/base.ts
import { LocalizedString, LocalizedStringRequired, PriceLevel } from '../common';

export interface PlaceAddress {
  full: LocalizedStringRequired;
  prefecture?: string;
  city?: string;
  postalCode?: string;
  formatted?: LocalizedStringRequired;
}

export interface AccessInfo {
  nearestStation?: string;
  walkingTime?: number;
  transportOptions?: string[];
}

export interface OpeningPeriod {
  day: number;  // 0-6 where 0 is Sunday
  open: string; // HH:mm format
  close: string; // HH:mm format
}

export interface OpeningHours {
  periods: OpeningPeriod[];
  weekdayTexts: LocalizedStringRequired;
  holidayDates?: Date[];
}

export interface PlaceImage {
  url: string;
  source: string;
  isCover: boolean;
  caption?: LocalizedString;
  name?: string; // Internal reference name (max 10 chars)
}

export interface PlacePricing {
  level: PriceLevel;
  currency: string;
  range?: {
    min: number;
    max: number;
  };
  details?: LocalizedString;
}

export interface PlaceContact {
  phone?: string;
  website?: string;
  bookingUrl?: string;
  googleMapsUrl?: string;
  socialMedia?: Record<string, string>;
}

export interface PlaceRating {
  google?: {
    rating: number;
    reviewCount: number;
  };
  internal?: {
    rating: number;
    reviewCount: number;
  };
}
