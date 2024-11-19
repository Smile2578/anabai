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
    name: string; // Ressource name for the photo
    widthPx: number;
    heightPx: number;
    authorAttributions?: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
    googleMapsUri?: string;
  }
  
  export interface GoogleReview {
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      uri: string;
      photoUri: string;
    };
    publishTime: string;
    googleMapsUri?: string;
  }
  
  export interface GoogleEditorialSummary {
    text: string;
    languageCode: string;
  }
  
  export interface GooglePaymentOptions {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  }
  
  export interface GoogleAccessibility {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  }
  