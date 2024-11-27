// hooks/useSessionManager.ts
import { useSession, signOut } from 'next-auth/react'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useSessionManager() {
  const { data: session, status, update } = useSession({
    required: false,
    onUnauthenticated() {
      console.log('🚫 [SessionManager] Session not authenticated')
    },
  })
  const router = useRouter()
  const setLoadingState = useAuthStore(state => state.setLoadingState)
  const setError = useAuthStore(state => state.setError)

  const login = useCallback(async (email: string, password: string, callbackUrl: string) => {
    try {
      console.log('🚀 [SessionManager] Login attempt:', { email, callbackUrl })
      setLoadingState('loading')

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl
      })

      console.log('📦 [SessionManager] SignIn result:', result)

      if (result?.error) {
        throw new Error(result.error)
      }

      await update()
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
  }, [router, update, setLoadingState, setError])

  const logout = useCallback(async () => {
    try {
      console.log('🚪 [SessionManager] Logout attempt')
      setLoadingState('loading')

      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      })

      console.log('✅ [SessionManager] Logout successful')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('❌ [SessionManager] Logout error:', error)
      setError(error instanceof Error ? error.message : 'Erreur de déconnexion')
    } finally {
      setLoadingState('idle')
    }
  }, [router, setLoadingState, setError])

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 [SessionManager] Refreshing session')
      await update()
      console.log('✅ [SessionManager] Session refreshed successfully')
    } catch (error) {
      console.error(' [SessionManager] Session refresh failed:', error)
      // Si l'erreur indique une session expirée, déconnexion
      if (error instanceof Error && error.message.includes('expired')) {
        await logout()
      }
    }
  }, [update, logout])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🔄 [SessionManager] Session status:', {
        status,
        hasSession: !!session,
        sessionData: session?.user?.id // Log minimal
      })
    }, 1000) // Délai pour éviter les logs excessifs

    return () => clearTimeout(timeoutId)
  }, [session?.user?.id, status, session])

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('⏰ [SessionManager] Setting up session refresh interval')
      
      // Éviter le rafraîchissement immédiat si la session est récente
      const lastRefresh = sessionStorage.getItem('lastSessionRefresh')
      const now = Date.now()
      
      if (!lastRefresh || now - parseInt(lastRefresh) > 5 * 60 * 1000) { // 5 minutes
        refreshSession()
        sessionStorage.setItem('lastSessionRefresh', now.toString())
      }

      const interval = setInterval(() => {
        refreshSession()
        sessionStorage.setItem('lastSessionRefresh', Date.now().toString())
      }, 15 * 60 * 1000) // 15 minutes
      
      return () => {
        console.log('🛑 [SessionManager] Clearing session refresh interval')
        clearInterval(interval)
      }
    }
  }, [status, refreshSession])

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    refreshSession
  }
}