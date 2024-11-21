// types/places/base.ts
import { Category, LocalizedString, LocalizedStringRequired, PriceLevel, Status } from '../common';
import { GooglePlace } from '../google/place';
import { Place } from './main';

export interface PlaceAddress {
  full: LocalizedStringRequired;
  prefecture?: string;
  city?: string;
  postalCode?: string;
  formatted: LocalizedStringRequired;
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
  name?: string; 
}

export interface PlacePricing {
  level?: PriceLevel;
  currency: string;
  range?: {
    min: number;
    max: number;
  };
  details: LocalizedStringRequired; // Now required
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

export interface PlaceFilters {
  search?: string;
  categories?: Category[];
  status?: Status;
  priceRange?: number[];
  sortBy?: {
    field: keyof Place;
    order: 'asc' | 'desc';
  };
}

export interface PlaceSearchResult {
  places: Place[];
  hasMore: boolean;
  total: number;
}


export interface PlaceSearchState {
  searchTerm: string;
  selectedPlace: GooglePlace | null;
  searchResults: GooglePlace[];
  isSearching: boolean;
  error: string | null;
}