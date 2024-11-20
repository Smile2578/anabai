// components/admin/places/PlaceCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Place } from '@/types/places/main';
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  User,
  Edit,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDate } from '@/lib/utils/date';

interface PlaceCardProps {
  place: Place;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onClick?: () => void;
}

function getPriceRangeSymbol(priceLevel?: number): string {
  if (!priceLevel) return '';
  return '¥'.repeat(priceLevel);
}

export function PlaceCard({
  place,
  onEdit,
  onDelete,
  onArchive,
  onClick
}: PlaceCardProps) {
  // Trouver l'image de couverture
  const coverImage = place.images.find(img => img.isCover) || place.images[0];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative aspect-video w-full">
          {coverImage ? (
            <Image
              src={coverImage.url}
              alt={place.name.fr}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Aucune image</span>
            </div>
          )}
          
          {/* Badge de statut */}
          <Badge 
            className="absolute bottom-2 right-2"
            variant={
              place.metadata.status === 'publié' ? 'default' :
              place.metadata.status === 'archivé' ? 'destructive' :
              'secondary'
            }
          >
            {place.metadata.status}
          </Badge>

          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                Supprimer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onArchive?.();
              }}>
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-4">
          {/* Titre et note */}
          <div className="space-y-1 mb-4">
            <h3 className="font-semibold truncate">{place.name.fr}</h3>
            {place.name.ja && (
              <p className="text-sm text-muted-foreground truncate">
                {place.name.ja}
              </p>
            )}
            {place.metadata.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{place.metadata.rating.toFixed(1)}</span>
                {place.metadata.userRatingsTotal && (
                  <span className="text-muted-foreground text-sm">
                    ({place.metadata.userRatingsTotal})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-1 mb-4">
            <Badge>{place.category}</Badge>
            {place.subcategories.map((sub, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {sub}
              </Badge>
            ))}
          </div>

          {/* Adresse */}
          <div className="flex items-start gap-2 text-sm mb-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm">
                {place.location.address.full?.fr}
              </p>
              {place.location.access?.nearestStation && (
                <p className="text-muted-foreground text-xs">
                  {place.location.access.nearestStation}
                  {place.location.access.walkingTime && 
                    ` (${place.location.access.walkingTime} min)`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Infos complémentaires */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t">
            {/* Prix */}
            {place.pricing?.level && (
              <div className="flex items-center gap-1">
                <span>{getPriceRangeSymbol(place.pricing.level)}</span>
              </div>
            )}
            
            {/* Création */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Créé le {formatDate(place.createdAt)}</span>
            </div>

            {/* Dernière modification */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Modifié le {formatDate(place.updatedAt)}</span>
            </div>

            {/* Vérifié par */}
            {place.metadata.verifiedBy && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Vérifié par {place.metadata.verifiedBy}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}