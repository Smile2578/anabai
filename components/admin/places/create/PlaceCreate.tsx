// components/admin/places/create/PlaceCreate.tsx
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlaceCreate } from '@/hooks/usePlaceCreate';
import { GooglePlaceSearch } from './GooglePlaceSearch';
import { PlacePreview } from './PlacePreview';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PlaceCreateProps {
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'editor';
  onSuccess: (placeId: string) => void;
}

export function PlaceCreate({ authorId, authorName, authorRole, onSuccess }: PlaceCreateProps) {
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
      onSuccess(placeId);
      router.push(`/admin/places/${placeId}`);
    },
    metadata: {
      authors: [{
        id: authorId,
        name: authorName,
        role: authorRole,
        addedAt: new Date()
      }]
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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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