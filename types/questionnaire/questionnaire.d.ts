// types/questionnaire/questionnaire.d.ts

export interface DateRange {
    from: Date;
    to: Date;
}
  
export interface BasicInfo {
    duration: number;
    dateRange: DateRange;
    groupSize: number;
    previousVisit: boolean;
    visitCount?: number;
    groupType: 'solo' | 'couple' | 'friends' | 'group' | 'family' | 'business';
    travelType: string;
    hasChildren: boolean;
    childrenCount?: number;
}
  
export interface TravelStyle {
    pace: 'slow' | 'moderate' | 'fast';
    comfort: 'backpacker' | 'standard' | 'comfort' | 'luxury';
    flexibility: number;
    culturalImmersion: number;
    preferences: string[];
}
  
export interface Interests {
    mainInterests: string[];
    specificInterests?: string[];
    categories: string[];
    mustSeeSpots?: string[];
}
  
export type BudgetType = 'low' | 'medium' | 'high' | 'higher' | 'undecided';
export type BudgetPriority = 'accommodation' | 'food' | 'activities' | 'undecided';

export interface Budget {
    total: number;
    dailyLimit: number;
    priority: BudgetPriority;
}
  
export interface Constraints {
    mobility: boolean;
    language: 'none' | 'basic' | 'intermediate' | 'fluent';
    dietary: string[];
    travelBudget: BudgetType;
    dailyBudget: BudgetType;
    budgetPriority: BudgetPriority;
}
  
export interface QuestionnaireData {
    basicInfo: BasicInfo;
    travelStyle: TravelStyle;
    interests: Interests;
    budget: Budget;
    constraints: Constraints;
    status?: QuestionnaireStatus;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    metadata?: {
        duration: number;
        totalTravelers: number;
        categories: string[];
        hasSpecialNeeds: boolean;
    };
}
  
export type QuestionnaireStatus = 'draft' | 'completed' | 'processing' | 'error';
  
export interface QuestionnaireStep {
    step: number;
    isCompleted: boolean;
    data: Partial<QuestionnaireData>;
}