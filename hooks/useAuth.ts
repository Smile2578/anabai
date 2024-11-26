// hooks/useAuth.ts
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = async (email: string, password: string) => {
    store.setLoadingState('loading');
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      const sessionData = await fetch('/api/auth/session').then(res => res.json());
      store.setAuth(sessionData, true);
      return { success: true };
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Erreur de connexion');
      store.setLoadingState('error');
      return { success: false, error };
    }
  };

  const logout = async () => {
    store.setLoadingState('loading');
    try {
      store.setAuth(null, false);
      await signOut({ redirect: false });
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Signout error:', error);
      store.setError('Erreur lors de la déconnexion');
      store.setLoadingState('error');
    }
  };

  return {
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.loadingState === 'loading',
    error: store.error,
    login,
    logout,
  };
}