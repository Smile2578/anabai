// types/places/base.ts
import { LocalizedString, LocalizedStringRequired } from '../common';

export interface PlaceAddress {
  full: LocalizedStringRequired;
  prefecture?: string;
  city?: string;
  postalCode?: string;
  formatted?: LocalizedStringRequired;
}

// Ou modifier la fonction pour accepter spécifiquement LocalizedStringRequired
export function formatOpeningHours(weekdayTexts: LocalizedStringRequired): string[] {
  if (!weekdayTexts?.fr) return [];
  return weekdayTexts.fr.split('\n');
}

export interface AccessInfo {
  nearestStation?: string;
  walkingTime?: number;
  transportOptions?: string[];
}

export interface OpeningPeriod {
  day: number;
  open: string;
  close: string;
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
  name?: string;
}

export interface PlacePricing {
  level?: 1 | 2 | 3 | 4 | null;  
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
    freeParking: boolean;     
    paidParking: boolean;     
    streetParking: boolean;   
    valetParking: boolean;    
    parkingAvailable: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking: boolean;    
    wheelchairAccessibleEntrance: boolean;   
    wheelchairAccessibleRestroom: boolean;   
    wheelchairAccessibleSeating: boolean;    
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