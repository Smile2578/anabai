// store/useAuthStore.ts
import { create } from 'zustand'
import { Session } from 'next-auth'

// Définition explicite de l'interface AuthState
export interface AuthState {
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: Session | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
}

// Création du store avec le type explicite
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) => set({ session }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading })
}))