// store/useAuthStore.ts
import { create } from 'zustand';
import { Session } from 'next-auth';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Définissons nos types d'état de chargement
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Définissons l'interface de notre state
export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  loadingState: LoadingState;
  error: string | null;
  // Actions
  setSession: (session: Session | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  // Actions combinées
  startLoading: () => void;
  finishLoading: (success: boolean, error?: string) => void;
  reset: () => void;
}

// Configuration du storage personnalisé
const storage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      const item = window.localStorage.getItem(key);
      return Promise.resolve(item);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
};

// État initial
const initialState = {
  session: null,
  isAuthenticated: false,
  loadingState: 'idle' as LoadingState,
  error: null,
};

// Création du store avec middlewares
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSession: (session) => set({ session }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setLoadingState: (loadingState) => set({ loadingState }),
        setError: (error) => set({ error }),
        startLoading: () => set({ loadingState: 'loading', error: null }),
        finishLoading: (success, error) => set({ 
          loadingState: success ? 'success' : 'error',
          error: error || null 
        }),
        reset: () => set(initialState),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => storage),
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          session: state.session,
        }),
      }
    )
  )
);