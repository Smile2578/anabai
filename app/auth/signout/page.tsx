// app/auth/signout/page.tsx
'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Déconnexion en cours...</p>
    </div>
  );
}