// types/google/place.ts
import {
  GoogleOpeningHours,
  GooglePhoto,
  GooglePriceRange,
  GooglePaymentOptions,
  GoogleRoutingSummary,
  GoogleAccessibilityOptions,
  GoogleParkingOptions,
  GoogleEditorialSummary,
  GoogleReview
} from './details';
import {
  GoogleAddressComponent,
  GoogleDisplayName,
  GoogleLocation,
  GoogleViewport
} from './base';

export interface GooglePlace {
  name: string; // Format: places/PLACE_ID
  id: string;   // PLACE_ID seul
  displayName: GoogleDisplayName;
  formattedAddress: string;
  addressComponents: GoogleAddressComponent[];
  location: GoogleLocation;
  viewport?: GoogleViewport;
  
  types: string[];
  primaryType?: string;
  primaryTypeDisplayName?: GoogleDisplayName;
  
  photos?: GooglePhoto[];
  editorialSummary?: GoogleEditorialSummary;
  rating?: number;
  userRatingCount?: number;
  reviews?: GoogleReview[];
  
  currentOpeningHours?: GoogleOpeningHours;
  regularOpeningHours?: GoogleOpeningHours;
  secondaryOpeningHours?: GoogleOpeningHours[];
  
  priceLevel?: 'PRICE_LEVEL_FREE' | 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE';
  priceRange?: GooglePriceRange;
  
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  
  businessStatus?: string;
  iconBackgroundColor?: string;
  iconMaskBaseUri?: string;
  
  accessibilityOptions?: GoogleAccessibilityOptions;
  parkingOptions?: GoogleParkingOptions;
  routingSummaries?: GoogleRoutingSummary[];
  delivery?: boolean;
  dineIn?: boolean;
  reservable?: boolean;
  takeout?: boolean;
  paymentOptions?: GooglePaymentOptions;
  
  // Food and drink options
  servesBeer?: boolean;
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesDinner?: boolean;
  servesLunch?: boolean;
  servesVegetarianFood?: boolean;
  servesWine?: boolean;
  
  utcOffsetMinutes?: number;
}