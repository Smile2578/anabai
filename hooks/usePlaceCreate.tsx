// hooks/usePlaceCreate.ts
export interface UsePlaceCreateOptions {
    onSuccess?: (placeId: string) => void;
    onError?: (error: Error) => void;
  }
  
  export function usePlaceCreate(options: UsePlaceCreateOptions) {
    const [state, setState] = useState<PlaceSearchState>({
      searchTerm: '',
      selectedPlace: null,
      isSearching: false,
      error: null
    });
    
    // On réutilise le service existant
    const googlePlacesService = new GooglePlacesService();
    
    const searchPlaces = useCallback(async (query: string) => {
      if (!query) return;
      
      setState(prev => ({ ...prev, isSearching: true, error: null }));
      try {
        const result = await googlePlacesService.searchPlace(query);
        if (result) {
          // On récupère immédiatement les détails pour avoir toutes les infos
          const details = await googlePlacesService.getPlaceDetails(result.id);
          setState(prev => ({ 
            ...prev, 
            selectedPlace: details,
            isSearching: false 
          }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Erreur de recherche',
          isSearching: false 
        }));
      }
    }, [googlePlacesService]);
  
    // ... reste de la logique
  }