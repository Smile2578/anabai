// store/useAuthStore.ts
import { create } from 'zustand'

interface AuthUIState {
  loadingState: 'idle' | 'loading' | 'error'
  error: string | null
  
  setLoadingState: (state: 'idle' | 'loading' | 'error') => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  loadingState: 'idle' as const,
  error: null,
}

export const useAuthStore = create<AuthUIState>((set) => ({
  ...initialState,
  
  setLoadingState: (loadingState) => {
    console.log('🔄 [Store] Setting loading state:', loadingState)
    set({ loadingState })
  },
  
  setError: (error) => set({ error }),
  
  reset: () => {
    console.log('🔄 [Store] Resetting store')
    set(initialState)
  }
}))