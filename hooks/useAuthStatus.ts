// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { AuthState, useAuthStore } from '@/store/useAuthStore'
import { Session } from 'next-auth'

// D'abord, définissons le type de retour de notre hook
interface AuthStatusReturn {
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuthStatus(): AuthStatusReturn {
  const { data: sessionData, status } = useSession()
  const { setSession, setIsAuthenticated, setIsLoading } = useAuthStore()
  
  useEffect(() => {
    setIsLoading(status === 'loading')
    setIsAuthenticated(status === 'authenticated')
    setSession(sessionData)
  }, [sessionData, status, setSession, setIsAuthenticated, setIsLoading])

  // Ici, nous spécifions explicitement le type pour le selector
  return useAuthStore((state: AuthState) => ({
    session: state.session,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading
  }))
}