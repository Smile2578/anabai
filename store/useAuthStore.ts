// store/useAuthStore.ts
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

type LoadingState = 'idle' | 'loading' | 'error' | 'success'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loadingState: LoadingState
  error: string | null
}

interface AuthActions {
  setLoadingState: (state: LoadingState) => void
  setError: (error: string | null) => void
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  reset: () => void
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loadingState: 'idle',
  error: null
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // État initial
  ...initialState,
  
  // Actions
  setLoadingState: (loadingState) => {
    console.log('🔄 [AuthStore] Setting loading state:', loadingState)
    set({ loadingState })
  },
  
  setError: (error) => {
    console.log('❌ [AuthStore] Setting error:', error)
    set({ error })
  },

  setUser: (user) => {
    console.log('👤 [AuthStore] Setting user:', user)
    set({ user, isAuthenticated: !!user })
  },

  setAuthenticated: (isAuthenticated) => {
    console.log('🔐 [AuthStore] Setting authenticated:', isAuthenticated)
    set({ isAuthenticated })
  },
  
  reset: () => {
    console.log('🔄 [AuthStore] Resetting store to initial state')
    set(initialState)
  }
}))

// Sélecteurs
export const selectLoadingState = (state: AuthState) => state.loadingState
export const selectError = (state: AuthState) => state.error
export const selectUser = (state: AuthState) => state.user