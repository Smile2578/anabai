// types/dashboard/cards.ts
import { LucideIcon } from 'lucide-react';


export interface DashboardCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export interface PreferencesCardProps {
  preferences: UserPreferences;
  onEdit?: () => void;
}

export interface UserPreferences {
  basicInfo: {
    startDate?: string;
    endDate?: string;
    duration?: number;
    groupSize?: number;
  };
  travelStyle: {
    pace?: 'relaxed' | 'moderate' | 'intensive';
    comfort?: 'budget' | 'standard' | 'luxury';
    flexibility?: number;
    culturalImmersion?: number;
  };
  interests: {
    mainInterests?: string[];
    subcategories?: string[];
  };
  budget: {
    total?: number;
    dailyLimit?: number;
    priority?: string;
  };
  constraints?: {
    dietary?: string[];
    language?: string;
    mobility?: boolean;
  };
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    label: string;
  };
  icon: LucideIcon;
}

export interface PlanningCardProps {
  trip?: TripPlanning;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface TripPlanning {
  id: string;
  status: string;
  progress: number;
  nextStep?: string;
  destinations?: string[];
}