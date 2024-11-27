// store/useAuthStore.ts
import { create } from 'zustand'
import type { User } from 'next-auth'

// Définition des types d'états de chargement
type LoadingState = 'idle' | 'loading' | 'error'

// Interface pour l'état UI
interface UIState {
  loadingState: LoadingState
  error: string | null
  user: User | null  // Ajout du type User
}

// Interface pour les actions
interface UIActions {
  setLoadingState: (state: LoadingState) => void
  setError: (error: string | null) => void
  setUser: (user: User | null) => void  // Nouvelle action
  reset: () => void
}

// État initial
const initialState: UIState = {
  loadingState: 'idle',
  error: null,
  user: null  // Initialisation de user
}

// Création du store
export const useAuthStore = create<UIState & UIActions>((set) => ({
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
    set({ user })
  },
  
  reset: () => {
    console.log('🔄 [AuthStore] Resetting store to initial state')
    set(initialState)
  }
}))

// Sélecteurs
export const selectLoadingState = (state: UIState) => state.loadingState
export const selectError = (state: UIState) => state.error
export const selectUser = (state: UIState) => state.user