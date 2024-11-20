// types/common.ts
export type Language = 'fr' | 'ja' | 'en';

export interface LocalizedString {
  fr?: string;
  ja?: string;
  en?: string;
}

export interface LocalizedStringRequired {
  [key: string]: string;  // Ajouter un index signature
  fr: string;
  ja?: string;
  en?: string;
}

export type GeographicPoint = {
  type: 'Point';
  coordinates: {
    lng: number;
    lat: number;
  };
};

export type Category = 'Restaurant' | 'Hôtel' | 'Visite' | 'Shopping' | 'Café & Bar';

export type Status = 'brouillon' | 'publié' | 'archivé';

export type PriceLevel = 1 | 2 | 3 | 4;