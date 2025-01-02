// components/auth/SignOutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function SignOutButton({ 
  variant = 'default',
  showIcon = false,
  fullWidth = false,
  className
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn(
        'gap-2',
        fullWidth && 'w-full',
        className
      )}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      Se déconnecter
    </Button>
  );
}