// components/admin/places/create/GooglePlaceSearch.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { GooglePlace } from '@/types/google/place';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface GooglePlaceSearchProps {
  onSelect: (place: GooglePlace) => void;
}

export function GooglePlaceSearch({ onSelect }: GooglePlaceSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/places/search-google?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Recherche impossible');
      const data = await response.json();
      setResults(data.places);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      searchPlaces(debouncedSearch);
    } else {
      setResults([]);
    }
  }, [debouncedSearch, searchPlaces]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4" />
        )}
      </div>
      
      {results.length > 0 && (
        <Card className="p-2">
          <ul className="space-y-2">
            {results.map((place) => (
              <li 
                key={place.id}
                className="p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => onSelect(place)}
              >
                <div className="font-medium">{place.displayName.text}</div>
                <div className="text-sm text-muted-foreground">
                  {place.formattedAddress}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}