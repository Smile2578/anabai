// app/admin/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/dashboard/layout/Header';
import Sidebar from '@/components/admin/Sidebar';
import { Loader } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loadingState } = useAuthStore();
  const router = useRouter();

  console.log('🔍 [AdminLayout] Current state:', {
    loadingState,
    user,
    userRole: user?.user_metadata?.role,
    isAdmin: user?.user_metadata?.role === 'admin',
    isEditor: user?.user_metadata?.role === 'editor'
  });

  useEffect(() => {
    console.log('🔄 [AdminLayout] useEffect triggered:', {
      loadingState,
      hasUser: !!user,
      userRole: user?.user_metadata?.role
    });

    if (loadingState !== 'success') {
      console.log('⏳ [AdminLayout] Still loading...');
      return;
    }

    if (!user) {
      console.log('⚠️ [AdminLayout] No user, redirecting to signin');
      router.replace('/auth/signin');
    } else if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'editor') {
      console.log('⚠️ [AdminLayout] User not admin/editor, redirecting to home:', {
        role: user.user_metadata?.role
      });
      router.replace('/');
    } else {
      console.log('✅ [AdminLayout] Access granted:', {
        role: user?.user_metadata?.role
      });
    }
  }, [loadingState, user, router]);

  if (loadingState !== 'success') {
    console.log('⏳ [AdminLayout] Loading...');
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'editor')) {
    console.log('❌ [AdminLayout] Access denied:', {
      hasUser: !!user,
      role: user?.user_metadata?.role
    });
    return null;
  }

  console.log('🎉 [AdminLayout] Rendering admin interface');
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