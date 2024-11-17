// components/admin/places/PlaceCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceBase } from '@/types/place';
import Image from 'next/image';

interface PlaceCardProps {
  place: PlaceBase;
  onClick?: () => void;
}

export const PlaceCard = ({ place, onClick }: PlaceCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div className="relative h-48 w-full">
          {place.images[0] && (
            <Image
            src={place.images[0]?.url || '/placeholder-image.jpg'}
            alt={`Image de ${place.name.fr}`}
            fill
              className="object-cover"
            />
          )}
          <div className="absolute top-2 right-2 space-x-2">
            <Badge variant={place.metadata.status === 'publié' ? 'default' : 'secondary'}>
              {place.metadata.status}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {place.name.fr}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {place.category}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{place.location.address.fr}</span>
            </div>
            {place.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {place.subcategories.map((sub) => (
                  <Badge key={sub} variant="outline" className="text-xs">
                    {sub}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};