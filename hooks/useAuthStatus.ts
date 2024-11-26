// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthStatus() {
  const { data: sessionData, status } = useSession();
  const store = useAuthStore();

  useEffect(() => {
    if (status === 'loading') {
      store.setLoadingState('loading');
    } else if (status === 'authenticated') {
      store.setAuth(sessionData, true);
    } else {
      store.setAuth(null, false);
    }
  }, [status, sessionData, store]);

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading'
  };
}