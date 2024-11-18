'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PlaceEditForm } from '@/components/admin/places/PlaceEditForm';
import { PlaceCard } from '@/components/admin/places/PlaceCard';
import { toast } from '@/hooks/use-toast';
import { Place } from '@/types/place';
import * as React from 'react';

interface PageParams {
  id: string;
}

export default function PlaceDetailsPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Utiliser React.use avec le type correct
  const { id } = React.use(params) as PageParams;

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        if (id === 'new') {
          setPlace(null);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/admin/places/${id}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération du lieu');
        
        const data = await response.json();
        setPlace(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du lieu",
          variant: "destructive"
        });
        router.push('/admin/places');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {id === 'new' ? 'Nouveau lieu' : 'Modifier le lieu'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PlaceEditForm 
            place={place || undefined}
            onSubmit={async () => {
              toast({
                title: "Succès", 
                description: "Le lieu a été sauvegardé avec succès",
              });
              router.push('/admin/places');
            }}
          />
        </div>
        
        <div className="lg:col-span-1">
          {place && (
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
              <PlaceCard place={place} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}