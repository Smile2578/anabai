// store/middleware/persist.ts
import { StateStorage, createJSONStorage } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { Session } from 'next-auth';

// Définition de notre interface d'état
interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  loadingState: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  setSession: (session: Session | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoadingState: (state: 'idle' | 'loading' | 'success' | 'error') => void;
  setError: (error: string | null) => void;
}

// Storage personnalisé pour localStorage
const customStorage: StateStorage = {
  getItem: (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${key}:`, error);
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Erreur lors de la suppression de ${key}:`, error);
    }
  },
};

// Création du store avec le type approprié
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      loadingState: 'idle',
      error: null,
      setSession: (session) => set({ session }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoadingState: (loadingState) => set({ loadingState }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        session: state.session,
      }),
    }
  )
);