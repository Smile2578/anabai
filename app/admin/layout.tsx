'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { Loader } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace('/auth/signin');
      return;
    }

    if (status === "authenticated") {
      const hasAccess = session?.user?.role === 'admin' || session?.user?.role === 'editor';
      setIsAuthorized(hasAccess);
      
      if (!hasAccess) {
        router.replace('/');
      }
    }
  }, [status, session, router]);

  // Afficher un loader pendant la vérification
  if (status === "loading" || isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Ne pas afficher le contenu si non autorisé
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}