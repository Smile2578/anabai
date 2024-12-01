// hooks/usePlaceFilters.tsx
import { useState, useCallback } from 'react';
import { Category, Status } from '@/types/common';

interface Filters {
  categories: Category[];
  status: Status[];
  priceRange: number[];
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  status: [],
  priceRange: []
};

export function usePlaceFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((
    type: keyof Filters,
    value: Category[] | Status[] | number[]
  ) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    handleFilterChange,
    clearFilters
  };
}