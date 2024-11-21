// hooks/usePlaceFilters.ts
import { useCallback, useState } from 'react';
import { PlaceFilters } from '@/types/places/base';
import { useDebounce } from './useDebounce';

export function usePlaceFilters(initialFilters?: Partial<PlaceFilters>) {
  const [filters, setFilters] = useState<PlaceFilters>({
    search: '',
    categories: [],
    status: undefined,
    priceRange: [],
    ...initialFilters
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const updateFilter = useCallback(<K extends keyof PlaceFilters>(
    key: K,
    value: PlaceFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      categories: [],
      status: undefined,
      priceRange: []
    });
  }, []);

  return {
    filters,
    debouncedSearch,
    updateFilter,
    clearFilters
  };
}