// hooks/useAuth.ts
import { useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const refreshAuth = useCallback(() => {
    if (status === 'authenticated') {
      update();
    }
    router.refresh();
  }, [status, update, router]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    refreshAuth
  };
}