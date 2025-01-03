import type { Database } from '@/types/database';
import type { 
  QuestionnaireData,
  BudgetPriority,
  BudgetType,
  Language,
  TravelStyle
} from '@/types/questionnaire/questionnaire';

export type DbQuestionnaire = Database['public']['Tables']['questionnaires']['Row'];

export type QuestionnaireApiResponse = {
  data: DbQuestionnaire | null;
  error?: string;
};

export type QuestionnaireProviderData = {
  basicInfo: {
    duration: number;
    dateRange: {
      from: Date;
      to: Date;
    };
    groupSize: number;
    previousVisit: boolean;
    visitCount?: number;
    groupType: 'solo' | 'couple' | 'friends' | 'group' | 'family' | 'business';
    travelType: string;
    hasChildren: boolean;
    childrenCount?: number;
  };
  travelStyle: {
    pace: TravelStyle['pace'];
    comfort: TravelStyle['comfort'];
    flexibility: number;
    culturalImmersion: number;
    preferences: string[];
  };
  interests: {
    mainInterests: string[];
    specificInterests: string[];
    categories: string[];
    mustSeeSpots: string[];
  };
  budget: {
    total: number;
    dailyLimit: number;
    priority: BudgetPriority;
  };
  constraints: {
    mobility: boolean;
    language: Language;
    dietary: string[];
    travelBudget: BudgetType;
    dailyBudget: BudgetType;
    budgetPriority: BudgetPriority;
  };
}; 