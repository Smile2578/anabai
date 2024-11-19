import { Category, GeographicPoint, LocalizedString, LocalizedStringRequired } from "../common";
import { AccessInfo, OpeningHours, PlaceAddress, PlaceContact, PlaceImage, PlacePricing, PlaceRating } from "./base";
import { PlaceMetadata } from "./metadata";

// types/places/main.ts
export interface Place {
    originalData?: {
      title?: string;
      note?: string;
      url?: string;
      comment?: string;
    };
    
    name: LocalizedStringRequired;
    location: {
      point: GeographicPoint;
      address: PlaceAddress;
      access?: AccessInfo;
    };
    
    category: Category;
    subcategories: string[];
    
    description?: LocalizedString;
    images: PlaceImage[];
    openingHours?: OpeningHours;
    pricing?: PlacePricing;
    contact?: PlaceContact;
    rating?: PlaceRating;
    
    metadata: PlaceMetadata;
    isActive: boolean;
    updatedAt: Date;
    createdAt: Date;
    _id: string;
  }

export type Status = 'brouillon' | 'publié' | 'archivé';
