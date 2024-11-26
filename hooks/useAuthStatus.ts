// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuthStatus() {
  const { data: session, status, update } = useSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setIsReady(true);
    }
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'authenticated') {
        update();
      }
    }, 1000); // Vérifier toutes les secondes pendant les premières minutes

    return () => clearInterval(interval);
  }, [status, update]);

  return {
    session,
    status,
    isReady,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || !isReady,
    update // Ajout de la fonction update dans le retour
  };
}