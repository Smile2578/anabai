// types/dashboard/cards.ts
import { LucideIcon } from "lucide-react";
import { TripPlanning } from "./stats";

export interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
}

export interface UserPreferences {
  travelStyle: {
    pace: 'moderate' | 'relaxed' | 'intensive';
    comfort: 'standard' | 'luxury' | 'budget';
    flexibility: number;
    culturalImmersion: number;
  };
  interests: {
    mainInterests: string[];
    subcategories: string[];
  };
}

export interface PreferencesCardProps {
  preferences: UserPreferences;
  onEdit: () => void;
}

export interface PlanningCardProps {
  trip: TripPlanning;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface DashboardCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}
