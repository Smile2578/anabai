// providers/AuthStateManager.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Session } from 'next-auth';

interface AuthStateManagerProps {
  session: Session | null;
}

export function AuthStateManager({ session }: AuthStateManagerProps) {
  const { setLoadingState } = useAuthStore();

  useEffect(() => {
    // Mise à jour de l'état de chargement en fonction de la présence ou non de la session
    setLoadingState(session === null ? 'loading' : 'idle');
  }, [session, setLoadingState]);

  return null;
}