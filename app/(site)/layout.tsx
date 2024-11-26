// app/(site)/layout.tsx
import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-12">
        {children}
      </main>
    </>
  );
}
