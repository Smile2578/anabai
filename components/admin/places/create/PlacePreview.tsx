// components/admin/places/create/PlacePreview.tsx
import { GooglePlace } from '@/types/google/place';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface PlacePreviewProps {
  place: GooglePlace;
  onConfirm: () => void;
  isLoading: boolean;
}

export function PlacePreview({ place, onConfirm, isLoading }: PlacePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu du lieu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium text-lg">{place.displayName.text}</div>
          <div className="text-muted-foreground">{place.formattedAddress}</div>
        </div>
        
        {place.primaryTypeDisplayName && (
          <Badge variant="outline">
            {place.primaryTypeDisplayName.text}
          </Badge>
        )}
        
        {place.businessStatus && (
          <Badge variant={place.businessStatus === 'OPERATIONAL' ? 'default' : 'secondary'}>
            {place.businessStatus}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onConfirm} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Créer le lieu'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}