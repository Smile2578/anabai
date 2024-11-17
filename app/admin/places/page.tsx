'use client';

import React from 'react';
import { PlaceEditForm } from '@/components/admin/places/PlaceEditForm';
import { useRouter } from 'next/navigation';
import { PlaceFormValues } from '@/types/form';

export default function NewPlacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const handleSubmit = async (data: PlaceFormValues) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/admin/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du lieu');
      }

      router.push('/admin/places');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <PlaceEditForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
