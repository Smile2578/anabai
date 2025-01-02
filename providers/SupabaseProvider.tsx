'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import type { SupabaseClient, User } from '@supabase/supabase-js'

interface SupabaseContextType {
  supabase: SupabaseClient
  user: User | null
  isLoading: boolean
  isInitialized: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase doit être utilisé dans un SupabaseProvider')
  }
  return context
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { setUser, setLoadingState, reset } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setLocalUser] = useState<User | null>(null)
  const supabase = createClient()

  // Effet pour l'initialisation de la session
  useEffect(() => {
    let mounted = true
    console.log('🔄 [SupabaseProvider] Initializing session')
    
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (!mounted) return

        if (session?.user) {
          console.log('✅ [SupabaseProvider] Initial session found:', session.user.email)
          setUser(session.user)
          setLocalUser(session.user)
          setLoadingState('success')
        } else {
          console.log('ℹ️ [SupabaseProvider] No initial session')
          setUser(null)
          setLocalUser(null)
          setLoadingState('idle')
        }
      } catch (error) {
        console.error('❌ [SupabaseProvider] Error getting session:', error)
        if (mounted) {
          setLoadingState('error')
          setUser(null)
          setLocalUser(null)
        }
      } finally {
        if (mounted) {
          console.log('✅ [SupabaseProvider] Initial loading complete')
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    // Initialiser la session immédiatement
    initSession()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [SupabaseProvider] Auth state changed:', event, session?.user?.email)
      
      if (!mounted) return

      try {
        if (event === 'SIGNED_OUT') {
          console.log('👋 [SupabaseProvider] User signed out')
          reset() // Réinitialiser tout l'état d'authentification
          setLocalUser(null)
          setLoadingState('idle')
          router.push('/auth/signin')
        } else if (session?.user) {
          console.log('✅ [SupabaseProvider] Setting user:', session.user.email)
          setUser(session.user)
          setLocalUser(session.user)
          setLoadingState('success')
        } else {
          console.log('ℹ️ [SupabaseProvider] No user in session')
          setUser(null)
          setLocalUser(null)
          setLoadingState('idle')
        }

        router.refresh()
      } catch (error) {
        console.error('❌ [SupabaseProvider] Error handling auth state change:', error)
        setLoadingState('error')
        setUser(null)
        setLocalUser(null)
      }
    })

    return () => {
      console.log('🧹 [SupabaseProvider] Cleaning up')
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, setUser, setLoadingState, reset, supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, user, isLoading, isInitialized }}>
      {children}
    </SupabaseContext.Provider>
  )
} 