// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div 
        className={cn(
          "mx-auto max-w-md rounded-lg bg-card p-6",
          "text-center shadow-lg"
        )}
      >
        <h1 className="mb-2 text-4xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page non trouvée</h2>
        <p className="mb-6 text-muted-foreground">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Button asChild>
          <Link href="/">
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}