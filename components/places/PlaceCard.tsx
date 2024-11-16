// components/places/PlaceCard.tsx
'use client';
import React from 'react';
import Image from 'next/image'; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Place } from '@/types/place';

interface PlaceCardProps {
  place: Place;
  variant?: 'default' | 'compact' | 'detailed';
  onSelect?: (place: Place) => void;
  onSave?: (place: Place) => void;
  isSaved?: boolean;
  className?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  variant = 'default',
  onSelect,
  onSave,
  isSaved = false,
  className = '',
}) => {
  return (
    <Card 
      className={`w-full overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}
      onClick={() => onSelect?.(place)}
    >
      {place.images?.[0] && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={place.images[0]}
            alt={place.name.en}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {variant !== 'compact' && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant={isSaved ? "secondary" : "outline"}>
                {place.category}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="space-y-1 p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{place.name.en}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {place.name.ja}
            </CardDescription>
          </div>
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onSave(place);
              }}
              className="ml-2"
            >
              {isSaved ? '❤️' : '🤍'}
            </Button>
          )}
        </div>
      </CardHeader>

      {variant !== 'compact' && (
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {place.description?.en}
          </p>
          {variant === 'detailed' && place.location?.address && (
            <p className="text-sm mt-2 text-muted-foreground">
              {place.location.address.en}
            </p>
          )}
        </CardContent>
      )}

      {variant === 'detailed' && (
        <CardFooter className="p-4 pt-0 flex justify-between">
          {place.pricing?.priceRange && (
            <div className="text-sm">
              {'¥'.repeat(place.pricing.priceRange)}
            </div>
          )}
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PlaceCard;