import { User } from '@supabase/supabase-js';

export interface SupabaseUser extends User {
  ban_duration?: string;
  user_metadata: {
    name?: string;
    role?: string;
  };
} 