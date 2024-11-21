// components/admin/places/create/PlacePreview.tsx
import { GooglePlace } from '@/types/google/place';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Phone, Globe, Star, Clock, Tag } from 'lucide-react';


interface PlacePreviewProps {
  place: GooglePlace;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function getPriceLevel(level?: string): string {
  switch (level) {
    case 'PRICE_LEVEL_FREE':
      return '¥';
    case 'PRICE_LEVEL_INEXPENSIVE':
      return '¥¥';
    case 'PRICE_LEVEL_MODERATE':
      return '¥¥¥';
    case 'PRICE_LEVEL_EXPENSIVE':
      return '¥¥¥¥';
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return '¥¥¥¥¥';
    default:
      return '¥¥¥';
  }
}

export function PlacePreview({
  place,
  onConfirm,
  onCancel,
  isLoading
}: PlacePreviewProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6 space-y-6">
        {/* En-tête avec nom et badges */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{place.displayName.text}</h3>
            {place.formattedAddress && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span>{place.formattedAddress}</span>
              </div>
            )}
          </div>

          {/* Badges et statuts */}
          <div className="flex flex-wrap gap-2">
            {/* Type de lieu */}
            {place.primaryTypeDisplayName && (
              <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-0">
                {place.primaryTypeDisplayName.text}
              </Badge>
            )}
            
            {/* Prix */}
            {place.priceLevel && (
              <Badge variant="outline">
                {getPriceLevel(place.priceLevel)}
              </Badge>
            )}

            {/* Statut */}
            {place.businessStatus && (
              <Badge 
                variant={place.businessStatus === 'OPERATIONAL' ? 'default' : 'secondary'}
              >
                {place.businessStatus === 'OPERATIONAL' ? 'Ouvert' : 'Fermé'}
              </Badge>
            )}
          </div>
        </div>

        {/* Détails et ratings */}
        <div className="grid gap-4">
          {/* Note et avis */}
          {place.rating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{place.rating.toFixed(1)}</span>
              {place.userRatingCount && (
                <span className="text-sm text-muted-foreground">
                  ({place.userRatingCount} avis)
                </span>
              )}
            </div>
          )}

          {/* Types et catégories */}
          {place.types && place.types.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 mt-1" />
              <div className="flex flex-wrap gap-1">
                {place.types.map((type) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className="text-xs bg-muted/50"
                  >
                    {type.toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Horaires */}
          {place.currentOpeningHours?.weekdayDescriptions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>Horaires d&apos;ouverture</span>
              </div>
              <div className="text-sm space-y-1 text-muted-foreground pl-6">
                {place.currentOpeningHours.weekdayDescriptions.map((day, index) => (
                  <p key={index}>{day}</p>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          <div className="space-y-2">
            {place.nationalPhoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{place.nationalPhoneNumber}</span>
              </div>
            )}
            
            {place.websiteUri && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <a 
                  href={place.websiteUri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Site web
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 pt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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