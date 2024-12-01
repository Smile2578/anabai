// types/places/filters.ts
import { PlaceFilters } from './base';

// Définition des valeurs par défaut pour les filtres
export const DEFAULT_PLACE_FILTERS: PlaceFilters = {
  search: '',
  categories: [],
  status: undefined,
  priceRange: undefined,
  sortBy: {
    field: 'name',
    order: 'asc'
  }
};