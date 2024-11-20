// types/google/place.ts
import { 
  GoogleOpeningHours, 
  GooglePhoto, 
  GooglePriceRange, 
  GooglePaymentOptions,
  GoogleRoutingSummary,
  GoogleAccessibilityOptions,
  GoogleParkingOptions,
  GoogleEditorialSummary
} from './details';
import { GoogleAddressComponent, GoogleDisplayName, GoogleLocation } from './base';

export interface GooglePlace {
  name: string;
  id: string;
  displayName: GoogleDisplayName;
  formattedAddress: string;
  addressComponents: GoogleAddressComponent[];
  location: GoogleLocation;
  
  types: string[];
  primaryType?: string;
  primaryTypeDisplayName?: GoogleDisplayName;
  
  photos?: GooglePhoto[];
  editorialSummary?: GoogleEditorialSummary;
  rating?: number;
  userRatingCount?: number;
  
  currentOpeningHours?: GoogleOpeningHours;
  regularOpeningHours?: GoogleOpeningHours;
  priceLevel?: string;
  priceRange?: GooglePriceRange;
  
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  
  businessStatus?: string;
  
  // Nouveaux champs
  accessibilityOptions?: GoogleAccessibilityOptions;
  parkingOptions?: GoogleParkingOptions;
  routingSummaries?: GoogleRoutingSummary[];
  delivery?: boolean;
  dineIn?: boolean;
  reservable?: boolean;
  takeout?: boolean;
  paymentOptions?: GooglePaymentOptions;
}