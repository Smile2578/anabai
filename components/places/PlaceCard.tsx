'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Place } from '@/types/places/main';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Banknote, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { PRICE_LEVELS } from '@/lib/config/price-levels';

interface PlaceCardProps {
  place: Place;
}

const CategoryIcon = ({ category }: { category: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'Restaurant': <span className="text-xl">🍜</span>,
    'Hôtel': <span className="text-xl">🏨</span>,
    'Visite': <span className="text-xl">🗼</span>,
    'Shopping': <span className="text-xl">🛍️</span>,
    'Café & Bar': <span className="text-xl">☕</span>
  };
  return icons[category] || null;
};

const PriceLevel = ({ pricing }: { pricing: Place['pricing'] }) => {
  if (!pricing?.level) return null;
  const priceInfo = PRICE_LEVELS.find(p => p.value === pricing.level);
  if (!priceInfo) return null;

  return (
    <div className="flex items-center gap-1">
      <Banknote className="h-3 w-3" />
      <span className="text-sm font-medium">{priceInfo.icon}</span>
    </div>
  );
};

export function PlaceCard({ place }: PlaceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const coverImage = place.images.find(img => img.isCover) || place.images[0];

  return (
    <Card className="w-72 overflow-hidden hover:shadow-lg transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Image et badges */}
        <div className="relative">
          <div className="relative h-48">
            {coverImage ? (
              <Image
                src={coverImage.url || '/images/placeholder.jpg'}
                alt={coverImage.caption?.fr || place.name.fr}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <CategoryIcon category={place.category} />
              </div>
            )}
            
            {/* Badges superposés */}
            <div className="absolute inset-0 p-2 flex flex-col justify-between">
              <div className="flex justify-between">
                <Badge className="bg-secondary backdrop-blur-sm">
                  {place.category}
                </Badge>
                {place.pricing && (
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    <PriceLevel pricing={place.pricing} />
                  </Badge>
                )}
              </div>
              {place.metadata?.rating && (
                <Badge variant="outline" className="self-end bg-background/80 backdrop-blur-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{place.metadata.rating.toFixed(1)}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold line-clamp-1">{place.name.fr}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{place.name.ja}</p>
          
          {/* Adresse cliquable */}
          <a 
            href={place.contact?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location.address.full.fr)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors group"
          >
            <MapPin className="h-3 w-3 shrink-0 mt-1 group-hover:text-secondary" />
            <span className="line-clamp-2">{place.location.address.full.fr}</span>
          </a>

          {/* Contacts cliquables */}
          <div className="flex justify-between text-sm">
            {place.contact?.website && (
              <a 
                href={place.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                <span>Site web</span>
              </a>
            )}
            {place.contact?.phone && (
              <a 
                href={`tel:${place.contact.phone}`}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                <span>{place.contact.phone}</span>
              </a>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-6 text-muted-foreground hover:text-primary"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-2">

            {place.openingHours?.weekdayTexts?.fr && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-3 w-3" />
                  <span>Horaires</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 pl-4">
                  {place.openingHours.weekdayTexts.fr.split('\n').map((day, index) => (
                    <p key={index}>{day}</p>
                  ))}
                </div>
              </div>
            )}

            {place.pricing && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Banknote className="h-3 w-3" />
                  <span>Tarification</span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  {PRICE_LEVELS.find(p => p.value === place.pricing?.level)?.description}
                </p>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
} 