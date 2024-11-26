// hooks/useAuthStatus.ts
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthStatus() {
  const { data: sessionData, status } = useSession();
  const store = useAuthStore();

  useEffect(() => {
    console.log('🔄 [AuthStatus] Changement de status:', status);
    console.log('📦 [AuthStatus] Données de session:', sessionData);

    if (status !== 'loading') {
      if (status === 'authenticated' && sessionData) {
        console.log('✅ [AuthStatus] Utilisateur authentifié, mise à jour du store');
        store.setAuth(sessionData, true);
      } else {
        console.log('❌ [AuthStatus] Utilisateur non authentifié, réinitialisation du store');
        store.setAuth(null, false);
      }
    }

    store.setLoadingState(status === 'loading' ? 'loading' : 'idle');
    console.log('🔄 [AuthStatus] Nouvel état de chargement:', store.loadingState);
  }, [status, sessionData, store]);

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading'
  };
}