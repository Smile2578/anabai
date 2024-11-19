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