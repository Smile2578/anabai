// hooks/useSessionManager.ts
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'


export function useSessionManager() {
  const { data: session, status } = useSession()
  const { setLoadingState } = useAuthStore()


  useEffect(() => {
    // Mise à jour du state UI en fonction du status de la session
    if (status === 'loading') {
      setLoadingState('loading')
    } else {
      setLoadingState('idle')
    }
  }, [status, setLoadingState])

  // Retourne les données de session et des helpers
  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isError: status === 'unauthenticated',
  }
}