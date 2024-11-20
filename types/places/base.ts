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
  day: number;  // 0-6, où 0 est dimanche
  open: string; // Format HH:mm
  close: string; // Format HH:mm
}

export interface OpeningHours {
  periods: OpeningPeriod[];
  weekdayTexts: LocalizedStringRequired;
  holidayDates?: Date[];
  specialHours?: {
    date: Date;
    open: string;
    close: string;
    description?: LocalizedString;
  }[];
}

export interface PlaceImage {
  url: string;
  source: string;
  isCover: boolean;
  caption?: LocalizedString;
  name?: string; // Nom de référence interne (max 10 caractères)
}

export interface PlacePricing {
  level?: PriceLevel;
  currency: string;
  range?: {
    min: number;
    max: number;
  };
  details?: LocalizedString;
}

export interface PracticalInfo {
  bookingRequired: boolean;
  englishSupport: boolean;
  paymentMethods: string[];
  delivery: boolean;
  dineIn: boolean;
  takeout: boolean;
  parkingOptions?: {
    freeParking?: boolean;
    paidParking?: boolean;
    streetParking?: boolean;
    valetParking?: boolean;
    parkingAvailable?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
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