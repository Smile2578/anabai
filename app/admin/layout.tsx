// app/admin/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/dashboard/layout/Header';
import Sidebar from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useSupabase } from '@/providers/SupabaseProvider';
import { LoadingSpinner } from '@/components/ui/loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isInitialized } = useSupabase();
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      setUser(user);
      console.log('✅ [AdminLayout] Utilisateur authentifié:', user.email);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isInitialized && !user) {
      console.log('🚫 [AdminLayout] Redirection vers /login');
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}