// app/admin/places/layout.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestion des Lieux | AnabAI Admin',
  description: 'Interface d\'administration des lieux pour AnabAI',
};

export default function PlacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}