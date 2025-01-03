export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury'
          status: 'active' | 'pending_verification' | 'inactive' | 'pending_setup'
          image?: string | null
          created_at: string
          updated_at: string
          last_login?: string | null
          last_login_ip?: string | null
          metadata?: Json | null
          providers?: Json | null
          verification_token?: string | null
          verification_token_expiry?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
          setup_token?: string | null
          setup_token_expiry?: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'editor' | 'user' | 'premium' | 'luxury'
          status?: 'active' | 'pending_verification' | 'inactive' | 'pending_setup'
          image?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          last_login_ip?: string | null
          metadata?: Json | null
          providers?: Json | null
          verification_token?: string | null
          verification_token_expiry?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
          setup_token?: string | null
          setup_token_expiry?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'editor' | 'user' | 'premium' | 'luxury'
          status?: 'active' | 'pending_verification' | 'inactive' | 'pending_setup'
          image?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          last_login_ip?: string | null
          metadata?: Json | null
          providers?: Json | null
          verification_token?: string | null
          verification_token_expiry?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
          setup_token?: string | null
          setup_token_expiry?: string | null
        }
      }
      questionnaires: {
        Row: {
          id: string
          user_id: string
          status: string
          created_at: string
          updated_at: string
          duration?: number | null
          date_range_from: string
          date_range_to: string
          group_size: number
          previous_visit: boolean
          visit_count?: number | null
          group_type: string
          travel_type: string
          has_children: boolean
          children_count?: number | null
          pace: string
          comfort: string
          flexibility: number
          cultural_immersion: number
          preferences?: string[] | null
          main_interests: string[]
          specific_interests?: string[] | null
          categories: string[]
          must_see_spots?: string[] | null
          total_budget: number
          daily_limit: number
          budget_priority: string
          mobility: boolean
          language: string
          dietary?: string[] | null
          travel_budget: string
          daily_budget: string
          metadata?: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          created_at?: string
          updated_at?: string
          duration?: number | null
          date_range_from: string
          date_range_to: string
          group_size: number
          previous_visit: boolean
          visit_count?: number | null
          group_type: string
          travel_type: string
          has_children: boolean
          children_count?: number | null
          pace: string
          comfort: string
          flexibility: number
          cultural_immersion: number
          preferences?: string[] | null
          main_interests: string[]
          specific_interests?: string[] | null
          categories: string[]
          must_see_spots?: string[] | null
          total_budget: number
          daily_limit: number
          budget_priority: string
          mobility: boolean
          language: string
          dietary?: string[] | null
          travel_budget: string
          daily_budget: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          created_at?: string
          updated_at?: string
          duration?: number | null
          date_range_from?: string
          date_range_to?: string
          group_size?: number
          previous_visit?: boolean
          visit_count?: number | null
          group_type?: string
          travel_type?: string
          has_children?: boolean
          children_count?: number | null
          pace?: string
          comfort?: string
          flexibility?: number
          cultural_immersion?: number
          preferences?: string[] | null
          main_interests?: string[]
          specific_interests?: string[] | null
          categories?: string[]
          must_see_spots?: string[] | null
          total_budget?: number
          daily_limit?: number
          budget_priority?: string
          mobility?: boolean
          language?: string
          dietary?: string[] | null
          travel_budget?: string
          daily_budget?: string
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'editor' | 'user' | 'premium' | 'luxury'
      user_status: 'active' | 'pending_verification' | 'inactive' | 'pending_setup'
    }
  }
} 