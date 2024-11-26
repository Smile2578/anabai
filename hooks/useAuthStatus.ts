// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuthStatus() {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setIsReady(true);
    }
  }, [status]);

  return {
    session,
    status,
    isReady,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
}