// hooks/usePlace.ts
import { useQuery } from '@tanstack/react-query';
import { Place } from '@/types/places/main';

export function usePlace(id: string) {
  return useQuery<Place>({
    queryKey: ['place', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/places/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du lieu');
      }
      return response.json();
    },
    enabled: id !== 'new',
  });
}