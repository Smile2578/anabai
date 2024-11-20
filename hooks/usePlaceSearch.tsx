// hooks/usePlaceSearch.ts
import { useQuery } from '@tanstack/react-query';
import { PlaceSearchResult } from '@/types/places/base';
import { useDebounce } from './useDebounce';

export function usePlaceSearch(searchTerm: string) {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useQuery<PlaceSearchResult>({
    queryKey: ['placeSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { places: [], hasMore: false, total: 0 };
      
      const params = new URLSearchParams({
        search: debouncedSearch,
        limit: '5'
      });

      const response = await fetch(`/api/admin/places/search?${params}`);
      if (!response.ok) throw new Error('Erreur de recherche');
      return response.json();
    },
    enabled: Boolean(debouncedSearch)
  });
}