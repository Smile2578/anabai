'use client';

import { PlaceCard } from '@/components/places/PlaceCard';
import { usePlace } from '@/hooks/usePlace';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PlaceCardTestPage() {
  const [randomId, setRandomId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRandomId() {
      const response = await fetch('/api/places/random');
      const data = await response.json();
      if (data.id) {
        setRandomId(data.id);
      }
    }
    fetchRandomId();
  }, []);

  const { place, isLoading, error } = usePlace(randomId || '');

  if (!randomId || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Une erreur est survenue lors du chargement du lieu.
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container py-6">
        <div className="rounded-lg bg-muted p-4">
          Lieu non trouvé.
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test PlaceCard</h1>
      <div className="max-w-2xl mx-auto">
        <PlaceCard place={place} />
      </div>
    </main>
  );
} 