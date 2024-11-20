// types/google/details.ts
export interface GoogleOpeningHoursPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
  };
  close?: {
    day: number;
    hour: number;
    minute: number;
  };
}

export interface GoogleOpeningHours {
  periods: GoogleOpeningHoursPeriod[];
  weekdayDescriptions: string[];
}

export interface GooglePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions?: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
  googleMapsUri?: string;
}

export interface GooglePriceRange {
  lowerPrice?: number;
  upperPrice?: number;
  text?: string;
}

export interface GooglePaymentOptions {
  acceptedPaymentTypes: string[];
}

export interface GoogleRoutingSummary {
  transitInfo?: {
    primaryMode: string;
    routeTypes?: string[];
  };
  duration: number;
  distanceMeters: number;
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