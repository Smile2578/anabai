// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthStatus() {
  const { data: sessionData, status } = useSession();
  const store = useAuthStore();

  useEffect(() => {
    console.log('🔄 [AuthStatus] Session update:', { status, sessionData });

    // Si nous avons une session valide mais que le store indique non authentifié
    if (status === 'authenticated' && sessionData && !store.isAuthenticated) {
      console.log('🔄 [AuthStatus] Synchronizing store with session');
      store.setAuth(sessionData, true);
    }
    
    // Si nous n'avons pas de session mais que le store indique authentifié
    if (status === 'unauthenticated' && store.isAuthenticated) {
      console.log('🔄 [AuthStatus] Clearing invalid auth state');
      store.setAuth(null, false);
    }

    store.setLoadingState(status === 'loading' ? 'loading' : 'idle');
  }, [status, sessionData, store]);

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading'
  };
}