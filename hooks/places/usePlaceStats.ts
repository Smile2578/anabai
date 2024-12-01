import { useQuery } from '@tanstack/react-query';

interface PlaceStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export function usePlaceStats() {
  const { data, isLoading, error, refetch } = useQuery<PlaceStats>({
    queryKey: ['placeStats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/places/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      return response.json();
    }
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch
  };
}