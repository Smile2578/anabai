// components/admin/places/PlaceList.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Place } from '@/types/place';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Calendar, User } from 'lucide-react';

interface PlaceListProps {
  places: Place[];
  onPlaceClick: (id: string) => void;
}

export function PlaceList({ places, onPlaceClick }: PlaceListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière modification</TableHead>
            <TableHead>Par</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {places.map((place, index) => (
            <motion.tr
              key={place._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPlaceClick(place._id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {place.images[0]?.url && (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={place.images[0].url}
                        alt={place.name.fr}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div>
                    <p>{place.name.fr}</p>
                    {place.name.ja && (
                      <p className="text-sm text-muted-foreground">{place.name.ja}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{place.category}</span>
                  {place.subcategories.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {place.subcategories.slice(0, 2).join(', ')}
                      {place.subcategories.length > 2 && '...'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="max-w-[200px] truncate">
                    {place.location.address.fr}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={place.metadata.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(place.updatedAt)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{place.metadata.verifiedBy || 'Non vérifié'}</span>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}