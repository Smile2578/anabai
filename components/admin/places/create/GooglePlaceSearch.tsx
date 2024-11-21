// components/admin/places/create/GooglePlaceSearch.tsx
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X, Loader2, Navigation2, Clock } from 'lucide-react';
import { GooglePlace } from '@/types/google/place';

interface GooglePlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: GooglePlace) => void;
  results?: GooglePlace[];
  isLoading?: boolean;
  error?: string | null;
}

export function GooglePlaceSearch({
  value,
  onChange,
  onSelect,
  results = [],
  isLoading,
  error
}: GooglePlaceSearchProps) {
  return (
    <div className="relative space-y-2">
      {/* Input de recherche */}
      <div className="relative">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
            isLoading ? "text-primary" : "text-muted-foreground"
          )} 
        />
        <Input
          type="text"
          placeholder="Entrez le nom d'un lieu au Japon..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {value && !isLoading && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin h-4 w-4 text-primary" 
          />
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}

      {/* Liste des résultats */}
      {value && results.length > 0 && (
        <Card className="absolute w-full z-50 mt-1 py-2 max-h-[300px] overflow-auto">
          <div className="space-y-1">
            {results.map((place) => (
              <Button
                key={place.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left px-4 py-3 space-y-1",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onSelect(place)}
              >
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="font-medium truncate">
                      {place.displayName.text}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <p className="truncate">{place.formattedAddress}</p>
                    </div>
                  </div>
                  <Navigation2 className="h-4 w-4 shrink-0 mt-1 text-muted-foreground" />
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Message "Aucun résultat" */}
      {value && results.length === 0 && !isLoading && !error && (
        <Card className="absolute w-full z-50 mt-1">
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Aucun lieu trouvé
          </div>
        </Card>
      )}
    </div>
  );
}