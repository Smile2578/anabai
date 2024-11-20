// types/google/base.ts
export interface GoogleLocation {
  latitude: number;
  longitude: number;
}

export interface GoogleDisplayName {
  text: string;
  languageCode: string;
}

export interface GoogleAddressComponent {
  longName: string;
  shortName: string;
  types: string[];
  languageCode?: string;
}

export interface GoogleViewport {
  low: GoogleLocation;
  high: GoogleLocation;
}

export interface GoogleAttributions {
  displayName: string;
  uri: string;
  photoUri?: string;
}