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
      setAuth: (session, isAuthenticated) => {
        console.log('📦 [Store] Setting auth state:', { session, isAuthenticated });
        set({ 
          session, 
          isAuthenticated,
          loadingState: 'idle'
        });
      },
      setLoadingState: (loadingState) => {
        console.log('🔄 [Store] Setting loading state:', loadingState);
        set({ loadingState });
      },
      setError: (error) => set({ error }),
      reset: () => {
        console.log('🔄 [Store] Resetting store');
        set(initialState);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        session: state.session,
      }),
      // Ajout d'options de persistance plus robustes
      version: 1,
      migrate: (persistedState: any, version: number) => {
        console.log('🔄 [Store] Migrating state version:', version);
        return persistedState;
      },
    }
  )
);

export const selectIsLoading = (state: AuthState) => state.loadingState === 'loading';