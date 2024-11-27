// hooks/useAuth.ts
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const router = useRouter();
  const { setLoadingState, setError } = useAuthStore();
  const { data: session, status } = useSession();

  const login = async (email: string, password: string) => {
    setLoadingState('loading');
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      setLoadingState('idle');
      router.refresh();
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
      setLoadingState('error');
      return { success: false, error };
    }
  };

  const logout = async () => {
    setLoadingState('loading');
    try {
      await signOut({ redirect: false });
      setLoadingState('idle');
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Signout error:', error);
      setError('Erreur lors de la déconnexion');
      setLoadingState('error');
    }
  };

  return {
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    error: useAuthStore(state => state.error),
    login,
    logout,
  };
}