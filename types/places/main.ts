// types/places/main.ts
import { Category, GeographicPoint, LocalizedString, LocalizedStringRequired, Subcategory } from '../common';
import { AccessInfo, OpeningHours, PlaceAddress, PlaceContact, PlaceImage, PlacePricing, PlaceRating, PracticalInfo } from './base';
import { PlaceMetadata } from './metadata';

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
  subcategories: Subcategory[];
  
  description?: LocalizedString;
  images: PlaceImage[];
  openingHours?: OpeningHours;
  pricing?: PlacePricing;
  contact?: PlaceContact;
  rating?: PlaceRating;
  practical_info?: PracticalInfo;
  
  metadata: PlaceMetadata;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
  isGem: boolean;
  _id: string;
}