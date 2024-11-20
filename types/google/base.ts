// types/google/base.ts
export interface GoogleDisplayName {
    text: string;
    languageCode: string;
  }
  
  export interface GoogleLocation {
    latitude: number;
    longitude: number;
  }
  
  export interface GoogleAddressComponent {
    longText: string;
    shortText: string;
    types: string[];
    languageCode?: string;
  }
  
  export interface GooglePlusCode {
    globalCode: string;
    compoundCode?: string;
  }
  
  export interface PracticalInfo {
    bookingRequired: boolean;
    englishSupport: boolean;
    paymentMethods: string[];
    budget_range?: string;
  }


  export interface GoogleViewport {
    northeast: GoogleLocation;
    southwest: GoogleLocation;
  }

  export interface GoogleAttributions {
    source: string;
    attributionUrl: string;
  }
