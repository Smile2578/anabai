// components/auth/SessionCheck.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionCheck({ children }: { children: React.ReactNode }) {
  const { status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated') {
      update();
    }

    const handleStorageChange = () => {
      console.log('🔄 [SessionCheck] Storage change detected');
      update();
      router.refresh();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [status, update, router]);

  useEffect(() => {
    console.log('🔄 [SessionCheck] Path change:', pathname);
    if (status !== 'loading') {
      router.refresh();
    }
  }, [pathname, status, router]);

  return <>{children}</>;
}