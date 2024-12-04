export type BudgetPriority = 'accommodation' | 'food' | 'activities' | 'undecided';

export interface Budget {
  total: number;
  dailyLimit: number;
  priority: BudgetPriority;
} 