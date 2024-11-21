// components/admin/places/create/PlaceCreate.tsx
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlaceCreate } from '@/hooks/usePlaceCreate';
import { GooglePlaceSearch } from './GooglePlaceSearch';
import { PlacePreview } from './PlacePreview';
import { AlertCircle, Loader2 } from 'lucide-react';

export function PlaceCreate() {
  const router = useRouter();

  const {
    searchTerm,
    selectedPlace,
    searchResults,
    isSearching,
    isCreating,
    error,
    handleSearchChange,
    handlePlaceSelect,
    createPlace,
    clearSelection,
  } = usePlaceCreate({
    onSuccess: (placeId) => {
      router.push(`/admin/places/${placeId}`);
    }
  });


  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPlace ? 'Aperçu du lieu' : 'Rechercher un lieu'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages d'erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Barre de recherche ou détails du lieu */}
          {!selectedPlace ? (
            <GooglePlaceSearch
              value={searchTerm}
              onChange={handleSearchChange}
              onSelect={handlePlaceSelect}
              results={searchResults}
              isLoading={isSearching}
              error={error}
            />
          ) : (
            <PlacePreview 
              place={selectedPlace}
              onConfirm={createPlace}
              onCancel={clearSelection}
              isLoading={isCreating}
            />
          )}
          
          {/* Loader pendant la création */}
          {isCreating && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Création du lieu en cours...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}