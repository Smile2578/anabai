// app/admin/places/[id]/layout.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Détails du lieu | AnabAI Admin',
  description: 'Interface de gestion des détails d\'un lieu pour AnabAI',
};

export default function PlaceDetailsLayout({
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
