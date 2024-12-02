// hooks/useAuth.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthUser } from '@/types/next-auth';

// Ce hook combine la gestion de l'authentification avec la navigation et le state global
export function useAuth(requiredRole?: 'admin' | 'editor' | 'user' | 'premium' | 'luxury') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    // Synchronisation du state global avec la session
    if (status === 'authenticated' && session?.user) {
      setUser(session.user as AuthUser);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status, setUser]);

  useEffect(() => {
    // Gestion des redirections basées sur l'authentification et les rôles
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (requiredRole && session?.user?.role !== requiredRole) {
      router.push('/');
    }
  }, [status, session, requiredRole, router]);

  return { session, status };
}