// components/admin/places/create/PlaceCreate.tsx
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { GooglePlace } from '@/types/google/place';
import { GooglePlaceSearch } from './GooglePlaceSearch';
import { PlacePreview } from './PlacePreview';

export function PlaceCreate() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  
  const { mutate: createPlace, isPending } = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await fetch('/api/admin/places/create', {
        method: 'POST',
        body: JSON.stringify({ placeId })
      });
      if (!response.ok) throw new Error('Création impossible');
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/admin/places/${data._id}`);
    }
  });

  const handlePlaceSelect = useCallback((place: GooglePlace) => {
    setSelectedPlace(place);
  }, []);

  return (
    <div className="space-y-4">
      <GooglePlaceSearch onSelect={handlePlaceSelect} />
      {selectedPlace && (
        <PlacePreview 
          place={selectedPlace}
          onConfirm={() => createPlace(selectedPlace.id)}
          isLoading={isPending}
        />
      )}
    </div>
  );
}