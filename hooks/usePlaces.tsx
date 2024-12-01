// hooks/usePlaces.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    withImages: number;
    withoutImages: number;
    totalRatings: number;
    averageRating: number;
    byCategory: Record<string, number>;
    byPrefecture: Record<string, number>;
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
  // Construction des paramètres de requête
  const params = new URLSearchParams();
  
  if (options.search?.trim()) {
    params.append('search', options.search.trim());
  }
  
  if (options.categories?.length) {
    options.categories.forEach(cat => params.append('categories[]', cat));
  }
  
  if (options.status) {
    params.append('status', options.status);
  }
  
  if (typeof options.page === 'number') {
    params.append('page', options.page.toString());
  }
  
  if (typeof options.limit === 'number') {
    params.append('limit', options.limit.toString());
  }
  
  if (options.isGem) {
    params.append('isGem', 'true');
  }

  const response = await fetch(`/api/admin/places?${params.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || 
      `Erreur lors de la récupération des lieux (${response.status})`
    );
  }

  return response.json();
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const queryClient = useQueryClient();
  const { page = 1, limit = 50 } = options;

  // Création d'une clé de requête stable qui inclut tous les filtres
  const queryKey = ['places', {
    search: options.search?.trim() || undefined,
    categories: options.categories?.length ? options.categories : undefined,
    status: options.status,
    page,
    limit,
    isGem: options.isGem
  }];
  
  const query = useQuery<PlacesResponse, Error>({
    queryKey,
    queryFn: () => fetchPlaces(options),
    staleTime: 30 * 1000, // Les données restent fraîches pendant 30 secondes
    placeholderData: (previousData) => previousData,
  });

  // Préchargement de la page suivante
  const prefetchNextPage = async () => {
    if (query.data && page < query.data.totalPages) {
      await queryClient.prefetchQuery({
        queryKey: ['places', { ...options, page: page + 1 }],
        queryFn: () => fetchPlaces({ ...options, page: page + 1 }),
      });
    }
  };

  return {
    places: query.data?.places ?? [],
    totalPages: query.data?.totalPages ?? 1,
    currentPage: query.data?.currentPage ?? page,
    stats: query.data?.stats ?? {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      withImages: 0,
      withoutImages: 0,
      totalRatings: 0,
      averageRating: 0,
      byCategory: {},
      byPrefecture: {}
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    prefetchNextPage,
  };
}