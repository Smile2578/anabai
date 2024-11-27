// store/useAuthStore.ts
import { create } from 'zustand'

// Définissons d'abord les types d'états de chargement possibles
type LoadingState = 'idle' | 'loading' | 'error'

// Interface pour l'état UI
interface UIState {
  loadingState: LoadingState
  error: string | null
}

// Interface pour les actions que nous pouvons effectuer sur l'état
interface UIActions {
  setLoadingState: (state: LoadingState) => void
  setError: (error: string | null) => void
  reset: () => void
}

// État initial
const initialState: UIState = {
  loadingState: 'idle',
  error: null
}

// Création du store avec les types combinés
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
  
  reset: () => {
    console.log('🔄 [AuthStore] Resetting store to initial state')
    set(initialState)
  }
}))

// Sélecteurs optionnels pour la performance
export const selectLoadingState = (state: UIState) => state.loadingState
export const selectError = (state: UIState) => state.error