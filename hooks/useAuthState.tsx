// hooks/useAuthState.ts
import { create } from 'zustand';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setAuth: (data: User) => void;
  reset: () => void;
}

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export const useAuthStore = create<AuthState>((set: (state: Partial<AuthState>) => void) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  setAuth: (data: User) => set({ isAuthenticated: true, user: data, isLoading: false }),
  reset: () => set({ isAuthenticated: false, user: null, isLoading: false })
}));

export function useAuthState() {
  const { data: session, status } = useSession();
  const { setAuth, reset } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuth(session.user);
    } else if (status === 'unauthenticated') {
      reset();
    }
  }, [session, status, setAuth, reset]);

  return useAuthStore();
}