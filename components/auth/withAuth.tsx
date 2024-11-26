// components/auth/withAuth.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string[]
) {
  return function ProtectedRoute(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      if (requiredRole && !requiredRole.includes(session.user.role)) {
        router.push('/');
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>;
    }

    if (!session || (requiredRole && !requiredRole.includes(session.user.role))) {
      return null;
    }

    return <Component {...props} />;
  };
}