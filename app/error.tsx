// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div 
        className={cn(
          "mx-auto max-w-md rounded-lg p-6",
          "bg-destructive/5 text-center"
        )}
      >
        <h2 className="mb-4 text-2xl font-bold text-destructive">
          Une erreur s&apos;est produite
        </h2>
        <p className="mb-4 text-muted-foreground">
          Désolé pour la gêne occasionnée. Nous travaillons à résoudre le problème.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => reset()}
          >
            Réessayer
          </Button>
          <Button
            variant="default"
            onClick={() => window.location.href = '/'}
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}