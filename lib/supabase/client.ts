// lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export const createClient = () => {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      },
      db: {
        schema: 'public'
      }
    }
  )

  // Ajouter des logs pour déboguer
  const originalFrom = supabase.from.bind(supabase)
  supabase.from = (table: string) => {
    console.log(`🔍 [Supabase] Accès à la table ${table}`)
    return originalFrom(table)
  }

  return supabase
} 