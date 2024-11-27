// providers/AuthStateManager.tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { Session } from 'next-auth'

interface AuthStateManagerProps {
  session: Session | null
}

export function AuthStateManager({ session }: AuthStateManagerProps) {
  const setLoadingState = useAuthStore(state => state.setLoadingState)
  const setUser = useAuthStore(state => state.setUser)

  useEffect(() => {
    console.log('🔄 [AuthStateManager] Session update:', { 
      present: !!session 
    })
    
    setLoadingState(session === null ? 'loading' : 'idle')
    
    // Utiliser setUser au lieu de setState directement
    if (session?.user) {
      setUser(session.user)
    } else {
      setUser(null)
    }
  }, [session, setLoadingState, setUser])

  return null
}