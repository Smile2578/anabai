// providers/AuthStateManager.tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { Session } from 'next-auth'

interface AuthStateManagerProps {
  session: Session | null
}

export function AuthStateManager({ session }: AuthStateManagerProps) {
  // Sélection ciblée de ce dont nous avons besoin
  const setLoadingState = useAuthStore(state => state.setLoadingState)

  useEffect(() => {
    console.log('🔄 [AuthStateManager] Session update:', { 
      present: !!session 
    })
    
    // Mise à jour intelligente de l'état de chargement
    setLoadingState(session === null ? 'loading' : 'idle')
  }, [session, setLoadingState])

  // Ce composant ne rend rien visuellement
  return null
}