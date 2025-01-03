// hooks/useSessionManager.ts
import { useAuthStore } from '@/store/useAuthStore'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useSessionManager() {
  const router = useRouter()
  const { user, loadingState, setLoadingState, setError } = useAuthStore()
  const supabase = createClient()

  const login = useCallback(async (email: string, password: string, callbackUrl: string) => {
    try {
      console.log('🚀 [SessionManager] Login attempt:', { email, callbackUrl })
      setLoadingState('loading')

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      console.log('📦 [SessionManager] SignIn result:', data)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push(callbackUrl)
      router.refresh()
      
      return true
    } catch (error) {
      console.error('❌ [SessionManager] Login error:', error)
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
      return false
    } finally {
      setLoadingState('idle')
    }
  }, [router, setLoadingState, setError, supabase])

  const logout = useCallback(async () => {
    try {
      console.log('🚪 [SessionManager] Logout attempt')
      setLoadingState('loading')

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      console.log('✅ [SessionManager] Logout successful')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('❌ [SessionManager] Logout error:', error)
      setError(error instanceof Error ? error.message : 'Erreur de déconnexion')
    } finally {
      setLoadingState('idle')
    }
  }, [router, setLoadingState, setError, supabase])

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 [SessionManager] Refreshing session')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }
      
      console.log('✅ [SessionManager] Session refreshed successfully')
      return session
    } catch (error) {
      console.error('❌ [SessionManager] Session refresh failed:', error)
      if (error instanceof Error && error.message.includes('expired')) {
        await logout()
      }
    }
  }, [logout, supabase])

  return {
    session: user ? { user } : null,
    isLoading: loadingState === 'loading',
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession
  }
}