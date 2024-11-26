// hooks/useAuth.ts
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const router = useRouter();
  const { 
    session, 
    isAuthenticated, 
    loadingState,
    error,
    startLoading,
    finishLoading,
    setSession,
    setIsAuthenticated 
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    startLoading();
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      setIsAuthenticated(true);
      const sessionData = await fetch('/api/auth/session').then(res => res.json());
      setSession(sessionData);
      
      finishLoading(true);
      return { success: true };
    } catch (error) {
      finishLoading(false, error instanceof Error ? error.message : 'Erreur de connexion');
      return { success: false, error };
    }
  };

  const logout = async () => {
    startLoading();
    try {
      setIsAuthenticated(false);
      setSession(null);
      await signOut({ redirect: false });
      router.refresh();
      router.push('/');
      finishLoading(true);
    } catch (error) {
      console.error('Signout error:', error);
      finishLoading(false, 'Erreur lors de la déconnexion');
      setIsAuthenticated(true);
    }
  };

  const checkAuth = () => {
    return {
      isAuthenticated,
      isLoading: loadingState === 'loading',
      isError: loadingState === 'error',
      error,
    };
  };

  return {
    session,
    login,
    logout,
    checkAuth,
  };
}