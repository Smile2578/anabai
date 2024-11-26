// components/auth/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  // Permettre la personnalisation de l'apparence pour différents contextes
  fullWidth?: boolean;
  showIcon?: boolean;
}

export function SignOutButton({ 
  className, 
  variant = 'destructive',
  fullWidth = false,
  showIcon = true
}: SignOutButtonProps) {
  const router = useRouter();
  const { setSession, setIsAuthenticated } = useAuthStore();

  const handleSignOut = async () => {
    try {
      // Mise à jour immédiate de l'UI
      setIsAuthenticated(false);
      setSession(null);

      // Déconnexion effective
      await signOut({
        redirect: false
      });

      // Rafraîchissement et redirection
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Restauration de l'état en cas d'erreur
      setIsAuthenticated(true);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      className={cn(
        fullWidth && "w-full",
        "text-red-600 focus:text-red-600",
        className
      )}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Se déconnecter
    </Button>
  );
}