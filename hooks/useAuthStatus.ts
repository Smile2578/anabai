// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthStatus() {
  const { data: sessionData, status } = useSession();
  const store = useAuthStore();

  useEffect(() => {
    // Ne mettre à jour que si le status n'est pas "loading"
    if (status !== 'loading') {
      if (status === 'authenticated' && sessionData) {
        store.setAuth(sessionData, true);
      } else {
        store.setAuth(null, false);
      }
    }

    // Mettre à jour l'état de chargement
    store.setLoadingState(status === 'loading' ? 'loading' : 'idle');
  }, [status, sessionData, store]);

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading'
  };
}