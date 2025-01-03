export type DateRange = {
  from: Date;
  to: Date;
}

export type Language = 'none' | 'basic' | 'intermediate' | 'fluent';
export type BudgetType = 'low' | 'medium' | 'high' | 'higher' | 'undecided';
export type BudgetPriority = 'accommodation' | 'food' | 'activities' | 'undecided';
export type QuestionnaireStatus = 'draft' | 'completed' | 'processing' | 'error';

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
  preferences?: string[];
}

export interface Interests {
  mainInterests: string[];
  specificInterests?: string[];
  categories: string[];
  mustSeeSpots?: string[];
}

export interface Budget {
  total: number;
  dailyLimit: number;
  priority: BudgetPriority;
}

export interface Constraints {
  mobility: boolean;
  language: Language;
  dietary?: string[];
  travelBudget: BudgetType;
  dailyBudget: BudgetType;
  budgetPriority: BudgetPriority;
}

export interface QuestionnaireStep {
  step: number;
  isCompleted: boolean;
  data: Partial<QuestionnaireData>;
}

export interface QuestionnaireData {
  id?: string;
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
    duration?: number;
    totalTravelers?: number;
    categories?: string[];
    hasSpecialNeeds?: boolean;
  };
}

export interface Database {
  public: {
    Tables: {
      questionnaires: {
        Row: {
          id: string;
          user_id: string;
          status: QuestionnaireStatus;
          created_at: string;
          updated_at: string;
          duration: number;
          date_range_from: string;
          date_range_to: string;
          group_size: number;
          previous_visit: boolean;
          visit_count: number | null;
          group_type: string;
          travel_type: string;
          has_children: boolean;
          children_count: number | null;
          pace: string;
          comfort: string;
          flexibility: number;
          cultural_immersion: number;
          preferences: string[];
          main_interests: string[];
          specific_interests: string[] | null;
          categories: string[];
          must_see_spots: string[] | null;
          total_budget: number;
          daily_limit: number;
          budget_priority: BudgetPriority;
          mobility: boolean;
          language: Language;
          dietary: string[];
          travel_budget: BudgetType;
          daily_budget: BudgetType;
          metadata: {
            duration: number;
            totalTravelers: number;
            categories: string[];
            hasSpecialNeeds: boolean;
          } | null;
        };
        Insert: Omit<Database['public']['Tables']['questionnaires']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questionnaires']['Row']>;
      };
    };
    Functions: {
      get_latest_questionnaire: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['questionnaires']['Row'];
      };
    };
  };
} 