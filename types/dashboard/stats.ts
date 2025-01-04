import { QuestionnaireData } from '../questionnaire/questionnaire';

export type BudgetPriority = 'food' | 'activities' | 'comfort' | 'experiences' | 'shopping' | 'accommodation';

export interface DashboardStats {
  budget: {
    total: number;
    dailyLimit: number;
    priority: QuestionnaireData['budget']['priority'];
    spent?: number;
    remaining?: number;
  };
  duration: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  preferences: {
    groupType: QuestionnaireData['basicInfo']['groupType'];
    groupSize: number;
    pace: 'moderate' | 'relaxed' | 'intensive';
    comfort: 'standard' | 'luxury' | 'budget';
    interests: string[];
  };
}

export interface TimelineEvent {
  id: string;
  type: 'hotel' | 'activity' | 'flight' | 'transport' | 'food';
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'ongoing';
  details?: string;
}

export interface Reservation {
  id: string;
  type: 'hotel' | 'activity' | 'flight';
  name: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
}

export interface ExpenseData {
  date: string;
  budget: number;
  actual: number;
}

export interface TripPlanning {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  nextStep?: string;
  destinations: string[];
} 