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
        },
        fetch: (url, options = {}) => {
          // Supprimer le rôle du JWT
          if (options.headers) {
            const headers = new Headers(options.headers as HeadersInit);
            const auth = headers.get('Authorization');
            if (auth) {
              const token = auth.split(' ')[1];
              const [header, payload, signature] = token.split('.');
              const decodedPayload = JSON.parse(atob(payload));
              // Supprimer le rôle du payload
              delete decodedPayload.role;
              // Reconstruire le token sans le rôle
              const newPayload = btoa(JSON.stringify(decodedPayload));
              headers.set('Authorization', `Bearer ${header}.${newPayload}.${signature}`);
              options.headers = Object.fromEntries(headers.entries());
            }
          }
          return fetch(url, options);
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