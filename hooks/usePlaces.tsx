// hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';
import { Category, Status } from '@/types/common';
import { Place } from '@/types/places/main';

interface PlacesResponse {
  places: Place[];
  totalPages: number;
  currentPage: number;
  stats: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
}

interface UsePlacesOptions {
  search?: string;
  categories?: Category[];
  status?: Status;
  page?: number;
  limit?: number;
  isGem?: boolean;
}

async function fetchPlaces(options: UsePlacesOptions): Promise<PlacesResponse> {
  const params = new URLSearchParams();
  
  if (options.search) params.append('search', options.search);
  if (options.categories?.length) {
    options.categories.forEach(cat => params.append('categories', cat));
  }
  if (options.status) params.append('status', options.status);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.isGem) params.append('isGem', 'true');

  const response = await fetch(`/api/admin/places?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }
  return response.json();
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const { page = 1 } = options;

  const queryKey = ['places', { ...options }];
  
  const query = useQuery<PlacesResponse, Error>({
    queryKey,
    queryFn: () => fetchPlaces(options),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  return {
    places: query.data?.places ?? [],
    totalPages: query.data?.totalPages ?? 1,
    currentPage: query.data?.currentPage ?? page,
    stats: query.data?.stats ?? {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch
  };
}