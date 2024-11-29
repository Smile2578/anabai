// types/places/main.ts
import { Category, LocalizedStringRequired, Subcategory } from '../common';
import { AccessInfo, OpeningHours, PlaceAddress, PlaceContact, PlaceImage, PlacePricing, PlaceRating, PracticalInfo, PlanningInfo } from './base';
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
    point: {
      type: 'Point';
      coordinates: [number, number]; 
    };
    address: PlaceAddress;
    access?: AccessInfo;
  };
  
  description: LocalizedStringRequired; 
  images: PlaceImage[]; 
  pricing?: PlacePricing; 
  
  category: Category;
  subcategories: Subcategory[];
  openingHours?: OpeningHours;
  contact?: PlaceContact;
  rating?: PlaceRating;
  practicalInfo?: PracticalInfo;
  metadata: PlaceMetadata;
  isActive: boolean;
  updatedAt: Date;
  createdAt: Date;
  isGem: boolean;
  _id: string;
  planningInfo?: PlanningInfo; 

}