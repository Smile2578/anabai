// hooks/usePlaceCreate.ts
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useDebounce } from './useDebounce';
import { PlaceSearchState } from '@/types/places/base';
import { GooglePlace } from '@/types/google/place';
import { PlaceMetadata } from '@/types/places/metadata';

export interface UsePlaceCreateOptions {
  onSuccess?: (placeId: string) => void;
  onError?: (error: Error) => void;
  metadata?: Partial<PlaceMetadata>;
}

export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const [state, setState] = useState<PlaceSearchState>({
    searchTerm: '',
    selectedPlace: null,
    searchResults: [],
    isSearching: false,
    error: null
  });

  const debouncedSearch = useDebounce(state.searchTerm, 300);

  // Recherche via notre API route
  const searchQuery = useQuery({
    queryKey: ['placeSearch', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      
      const response = await fetch(
        `/api/admin/places/search-google?query=${encodeURIComponent(debouncedSearch)}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de recherche');
      }

      return response.json().then(data => data.places);
    },
    enabled: Boolean(debouncedSearch),
    staleTime: 5 * 60 * 1000 // Cache valide 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await fetch('/api/admin/places/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, metadata: options.metadata })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du lieu');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        description: "Le lieu a été créé avec succès"
      });
      options.onSuccess?.(data._id);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Erreur lors de la création du lieu"
      });
      options.onError?.(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  });

  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({ 
      ...prev, 
      searchTerm: value,
      error: null 
    }));
  }, []);

  const handlePlaceSelect = useCallback((place: GooglePlace) => {
    setState(prev => ({
      ...prev,
      selectedPlace: place,
      searchResults: [],
      error: null
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPlace: null,
      searchTerm: '',
      searchResults: [],
      error: null
    }));
  }, []);

  const createPlace = useCallback(() => {
    if (state.selectedPlace?.id) {
      createMutation.mutate(state.selectedPlace.id);
    }
  }, [state.selectedPlace?.id, createMutation]);

  return {
    searchTerm: state.searchTerm,
    selectedPlace: state.selectedPlace,
    searchResults: searchQuery.data || [],
    isSearching: searchQuery.isFetching || state.isSearching,
    error: state.error || (searchQuery.error instanceof Error ? searchQuery.error.message : null),
    isCreating: createMutation.isPending,

    handleSearchChange,
    handlePlaceSelect,
    createPlace,
    clearSelection,

    createError: createMutation.error instanceof Error ? createMutation.error.message : null
  };
}