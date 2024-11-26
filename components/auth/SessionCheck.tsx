// components/auth/SessionCheck.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function SessionCheck({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}