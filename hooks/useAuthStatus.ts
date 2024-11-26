// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Session } from 'next-auth';

interface AuthStatusReturn {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuthStatus(): AuthStatusReturn {
  const { data: sessionData, status } = useSession();
  const store = useAuthStore();
  
  useEffect(() => {
    store.setLoadingState(status === 'loading' ? 'loading' : 'idle');
    store.setIsAuthenticated(status === 'authenticated');
    store.setSession(sessionData);
  }, [sessionData, status, store]);

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading',
  };
}