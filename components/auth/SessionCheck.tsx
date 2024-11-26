// components/auth/SessionCheck.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionCheck({ children }: { children: React.ReactNode }) {
  const { status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const refreshState = useCallback(() => {
    console.log('🔄 [SessionCheck] Refreshing state');
    router.refresh();
    if (status === 'authenticated') {
      update();
    }
  }, [router, status, update]);

  // Premier montage
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Changement de chemin
  useEffect(() => {
    console.log('🔄 [SessionCheck] Path change:', pathname);
    refreshState();
  }, [pathname, refreshState]);

  // Écouter les changements de stockage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 [SessionCheck] Storage change detected');
      refreshState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshState]);

  return <>{children}</>;
}