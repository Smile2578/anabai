// hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';
import { Category, Status } from '@/types/common';

interface UsePlacesOptions {
  search?: string;
  category?: Category;
  status?: Status;
  page?: number;
  limit?: number;
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const {
    search = '',
    category,
    status,
    page = 1,
    limit = 20
  } = options;

  return useQuery({
    queryKey: ['places', { search, category, status, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/admin/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des lieux');
      }
      return response.json();
    }
  });
}