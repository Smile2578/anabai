// components/layout/HeaderWrapper.tsx

'use client';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
    </>
  );
}