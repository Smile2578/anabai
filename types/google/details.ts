// types/google/details.ts
import { GoogleAttributions, GoogleDisplayName } from './base';

export interface GoogleOpeningHoursPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
    truncated?: boolean;
  };
  close?: {
    day: number;
    hour: number;
    minute: number;
    truncated?: boolean;
  };
}

export interface GoogleOpeningHours {
  periods: GoogleOpeningHoursPeriod[];
  weekdayDescriptions: string[];
  type?: string;
}

export interface GooglePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions?: GoogleAttributions[];
  googleMapsUri?: string;
}

export interface GooglePriceRange {
  lowerPrice?: number;
  upperPrice?: number;
  text?: string;
  priceType?: string;
}

export interface GooglePaymentOptions {
  acceptedPaymentTypes?: string[];
  primaryType?: string;
}

export interface GoogleRoutingSummary {
  transitInfo?: {
    primaryMode: string;
    routeTypes?: string[];
    departurePlatform?: string;
    arrivalPlatform?: string;
    transitLine?: {
      name: string;
      uri?: string;
      color?: string;
    };
  };
  duration: number;
  distanceMeters: number;
  staticDuration?: boolean;
  polyline?: string;
  description?: GoogleDisplayName;
}

export interface GoogleAccessibilityOptions {
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
}

export interface GoogleParkingOptions {
  freeParking?: boolean;
  paidParking?: boolean;
  streetParking?: boolean;
  valetParking?: boolean;
  parkingAvailable?: boolean;
}

export interface GoogleEditorialSummary {
  text: string;
  languageCode: string;
}

export interface GoogleReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: {
    text: string;
    languageCode: string;
  };
  authorAttribution: GoogleAttributions;
  publishTime: string;
  googleMapsUri?: string;
}