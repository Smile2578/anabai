// providers/AuthStateManager.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { Session } from 'next-auth';

interface AuthStateManagerProps {
  session: Session | null;
}

export function AuthStateManager({ session }: AuthStateManagerProps) {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    setAuth(session, !!session);
  }, [session, setAuth]);

  return null;
}