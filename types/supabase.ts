export type UserRole = 'admin' | 'editor' | 'user' | 'premium' | 'luxury'
export type UserStatus = 'active' | 'inactive' | 'pending_verification'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole
          status: UserStatus
          name: string
          avatar_url?: string
          updated_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
} 