// lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'
import { type RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function createClient() {
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: async () => {
          const cookieStore = await cookies()
          return cookieStore.getAll().map((cookie: RequestCookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll: async (cookiesList: { name: string; value: string; options?: CookieOptions }[]) => {
          const cookieStore = await cookies()
          cookiesList.forEach(({ name, value, options = {} }) => {
            cookieStore.set({ name, value, ...options })
          })
        }
      }
    }
  )
} 