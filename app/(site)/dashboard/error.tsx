'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erreur du tableau de bord:', error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Une erreur est survenue
        </h2>
      </div>
      
      <p className="text-muted-foreground text-center max-w-[500px]">
        Nous n&apos;avons pas pu charger votre tableau de bord. Veuillez réessayer ultérieurement.
      </p>

      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Réessayer
      </button>
    </div>
  );
}
