// types/questionnaire/questionnaire.ts

export interface BasicInfo {
    duration: number;
    startDate?: string;
    endDate?: string;
    groupSize: number;
  }
  
  export interface TravelStyle {
    pace: 'relaxed' | 'moderate' | 'intensive';
    comfort: 'budget' | 'standard' | 'luxury';
    flexibility: number;
    culturalImmersion: number;
  }
  
  export interface Interests {
    mainInterests: string[];
    subcategories: string[];
    mustSeeSpots?: string[];
    categories?: string[];
    specificInterests?: string[];
  }
  
  export interface Budget {
    total: number;
    dailyLimit: number;
    priority: 'accommodation' | 'food' | 'activities';
  }
  
  export interface Constraints {
    dietary?: string[];
    mobility: boolean;
    language: 'none' | 'basic' | 'intermediate' | 'fluent';
  }
  
  export interface QuestionnaireData {
    basicInfo: BasicInfo;
    travelStyle: TravelStyle;
    interests: Interests;
    budget: Budget;
    constraints: Constraints;
  }
  
  export type QuestionnaireStatus = 'draft' | 'completed' | 'processing' | 'error';