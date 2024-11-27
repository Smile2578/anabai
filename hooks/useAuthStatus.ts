// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthStatus() {
  const { data: sessionData, status } = useSession();
  const { setLoadingState } = useAuthStore();

  useEffect(() => {
    console.log('🔄 [AuthStatus] Session update:', { status, sessionData });

    // Mise à jour de l'état de chargement en fonction du status de la session
    setLoadingState(status === 'loading' ? 'loading' : 'idle');
  }, [status, sessionData, setLoadingState]);

  // Nous retournons directement les données de Next-Auth plutôt que du store
  return {
    session: sessionData,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
}