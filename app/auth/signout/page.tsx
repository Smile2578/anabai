// app/auth/signout/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleSignOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
      router.push('/');
      router.refresh();
    };

    handleSignOut();
  }, [router, supabase.auth]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Déconnexion en cours...</p>
    </div>
  );
}
