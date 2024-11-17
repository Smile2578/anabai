// types/google-places.ts
export interface PlaceAddressComponent {
    longText: string;
    shortText: string;
    types: string[];
    languageCode?: string;
  }
  
  export interface PlaceOpeningHours {
    periods: Array<{
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
    }>;
    weekdayDescriptions: string[];
  }
  
  export interface PlacePhoto {
    name: string;
    uri?: string;
    heightPx?: number;
    widthPx?: number;
    authorAttributions?: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
  }
  
  export interface GooglePlaceResult {
    id: string;
    displayName?: {
      text: string;
      languageCode?: string;
    };
    formattedAddress?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    types?: string[];
    primaryType?: string;
    editorialSummary?: {
      text: string;
      languageCode?: string;
    };
    photos?: PlacePhoto[];
    regularOpeningHours?: PlaceOpeningHours;
    priceLevel?: number;
    rating?: number;
    userRatingCount?: number;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    addressComponents?: PlaceAddressComponent[];
  }