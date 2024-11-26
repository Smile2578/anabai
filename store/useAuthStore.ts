// store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session } from 'next-auth';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  loadingState: LoadingState;
  error: string | null;
  
  // Actions simplifiées
  setAuth: (session: Session | null, isAuthenticated: boolean) => void;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  isAuthenticated: false,
  loadingState: 'idle' as LoadingState,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (session, isAuthenticated) => 
        set({ 
          session, 
          isAuthenticated,
          loadingState: 'success'
        }),

      setLoadingState: (loadingState) => 
        set({ loadingState }),

      setError: (error) => 
        set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        session: state.session,
      }),
    }
  )
);

export const selectIsLoading = (state: AuthState) => state.loadingState === 'loading';