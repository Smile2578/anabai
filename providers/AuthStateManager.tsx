// components/providers/AuthStateManager.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Session } from 'next-auth';

interface AuthStateManagerProps {
  session: Session | null;
}

export function AuthStateManager({ session }: AuthStateManagerProps) {
  const store = useAuthStore();

  useEffect(() => {
    store.setLoadingState('idle');
    store.setIsAuthenticated(!!session);
    store.setSession(session);
  }, [session, store]);

  return null;
}