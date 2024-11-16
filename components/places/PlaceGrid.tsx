// components/places/PlaceGrid.tsx
'use client';
import React from 'react';
import PlaceCard from './PlaceCard';
import { Place } from '@/types/place';

interface PlaceGridProps {
  places: Place[];
  variant?: 'default' | 'compact' | 'detailed';
  onPlaceSelect?: (place: Place) => void;
  onPlaceSave?: (place: Place) => void;
  savedPlaces?: Set<string>;
  className?: string;
}

const PlaceGrid: React.FC<PlaceGridProps> = ({
  places,
  variant = 'default',
  onPlaceSelect,
  onPlaceSave,
  savedPlaces = new Set(),
  className = '',
}) => {
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {places.map((place) => (
        <PlaceCard
          key={place._id}
          place={place}
          variant={variant}
          onSelect={onPlaceSelect}
          onSave={onPlaceSave}
          isSaved={savedPlaces.has(place._id)}
        />
      ))}
    </div>
  );
};

export default PlaceGrid;