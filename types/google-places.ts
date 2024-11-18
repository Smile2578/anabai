// types/google-places.ts

export interface PlaceDisplayName {
  text: string;
  languageCode: string;
}

export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

export interface PlaceAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

export interface PlaceOpeningHoursPeriod {
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

export interface PlaceOpeningHours {
  periods: PlaceOpeningHoursPeriod[];
  weekdayDescriptions: string[];
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

export interface PlaceEditorialSummary {
  text: string;
  languageCode: string;
}

export interface PlaceResult {
  id: string;
  displayName: PlaceDisplayName;
  formattedAddress: string;
  location: PlaceLocation;
  accessInfo?: {
    nearestStation?: string;
    walkingTime?: number;
  };
  addressComponents: PlaceAddressComponent[];
  types: string[];
  primaryType: string;
  primaryTypeDisplayName: PlaceDisplayName;
  currentOpeningHours?: PlaceOpeningHours;
  editorialSummary?: PlaceEditorialSummary;
  photos?: PlacePhoto[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
}