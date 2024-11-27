// components/auth/SignOutButton.tsx
'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  fullWidth?: boolean;
  showIcon?: boolean;
}

export function SignOutButton({ 
  className, 
  variant = 'destructive',
  fullWidth = false,
  showIcon = true
}: SignOutButtonProps) {
  const setLoadingState = useAuthStore(state => state.setLoadingState)


  const handleSignOut = async () => {
    console.log('🚀 [SignOut] Starting logout process')
    setLoadingState('loading')
    
    try {
      await signOut()
      console.log('✅ [SignOut] Logout successful')
    } catch (error) {
      console.error('❌ [SignOut] Logout error:', error)
    } finally {
      setLoadingState('idle')
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      className={cn(
        fullWidth && "w-full",
        className
      )}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Se déconnecter
    </Button>
  );
}