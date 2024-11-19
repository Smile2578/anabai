import { GoogleAddressComponent, GoogleDisplayName, GoogleLocation, GooglePlusCode } from "./base";
import { GoogleAccessibility, GoogleEditorialSummary, GooglePaymentOptions, GoogleReview, GoogleOpeningHours, GooglePhoto } from "./details";


// types/google/place.ts
export interface GooglePlace {
    name: string; // Resource name (places/PLACE_ID)
    id: string;  // Place ID
    displayName: GoogleDisplayName;
    formattedAddress: string;
    addressComponents: GoogleAddressComponent[];
    location: GoogleLocation;
    plusCode?: GooglePlusCode;
    
    types: string[];
    primaryType?: string;
    primaryTypeDisplayName?: GoogleDisplayName;
    
    photos?: GooglePhoto[];
    editorialSummary?: GoogleEditorialSummary;
    rating?: number;
    userRatingCount?: number;
    
    currentOpeningHours?: GoogleOpeningHours;
    regularOpeningHours?: GoogleOpeningHours;
    secondaryOpeningHours?: GoogleOpeningHours[];
    weekdayDescriptions?: string[];
    priceLevel?: string;
    paymentOptions?: GooglePaymentOptions;
    accessibility?: GoogleAccessibility;
    
    internationalPhoneNumber?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    
    businessStatus?: string;
    reviews?: GoogleReview[];
    
    // Liens spéciaux Google Maps
    googleMapsLinks?: {
      placeUri?: string;
      directionsUri?: string;
      photosUri?: string;
      reviewsUri?: string;
      writeAReviewUri?: string;
    };
  } 