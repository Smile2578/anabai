// hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';
import { Category, Status } from '@/types/common';
import { Place } from '@/types/places/main';

interface PlacesResponse {
  places: Place[];
  totalPages: number;
  stats: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    withImages: number;
    withoutImages: number;
    totalRatings: number;
    averageRating: number;
    byCategory: Record<string, number>;
    byPrefecture: Record<string, number>;
  };
}

interface UseplacesOptions {
  search?: string;
  category?: Category;
  status?: Status;
  page?: number;
  limit?: number;
  isGem?: boolean;
}

export function usePlaces(options: UseplacesOptions = {}) {
  const { search, category, status, page = 1, limit = 50, isGem } = options;

  return useQuery<PlacesResponse>({
    queryKey: ['places', { search, category, status, page, limit, isGem }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (isGem) params.append('isGem', 'true');
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/admin/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des lieux');
      }
      return response.json();
    },
  });
}