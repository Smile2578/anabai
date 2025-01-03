'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
  isInitialized: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user: initialUser } } = await supabase.auth.getUser()
        setUser(initialUser)
      } catch (error) {
        console.error('❌ [SupabaseProvider] Erreur:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [SupabaseProvider] Changement d\'état auth:', event)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 [SupabaseProvider] Utilisateur connecté:', session.user.email)
        // Réinitialiser le client avec le nouveau token
        supabase.realtime.setAuth(session.access_token)
      } else {
        console.log('👤 [SupabaseProvider] Utilisateur déconnecté')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <Context.Provider value={{ supabase, user, isInitialized }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useSupabase doit être utilisé dans un SupabaseProvider')
  }

  return context
}