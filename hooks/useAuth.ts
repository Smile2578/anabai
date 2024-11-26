// hooks/useAuth.ts
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status, update } = useSession();

  const refreshAuth = useCallback(async () => {
    if (status === 'authenticated') {
      await update();
    }
  }, [status, update]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    refreshAuth
  };
}