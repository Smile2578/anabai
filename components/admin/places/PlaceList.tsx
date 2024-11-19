// components/admin/places/PlaceList.tsx
import React from 'react';
import { Place } from '@/types/places/main';
import { PlaceCard } from './PlaceCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface PlaceListProps {
  places: Place[];
  onPlaceClick: (id: string) => void;
  onPlaceDelete: (id: string) => Promise<void>;
  onPlaceArchive: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function PlaceList({ 
  places, 
  onPlaceClick, 
  onPlaceDelete,
  onPlaceArchive,
  isLoading 
}: PlaceListProps) {
  const [placeToDelete, setPlaceToDelete] = React.useState<Place | null>(null);
  const [placeToArchive, setPlaceToArchive] = React.useState<Place | null>(null);
  const { toast } = useToast();

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!placeToDelete) return;
    try {
      await onPlaceDelete(placeToDelete._id);
      toast({
        title: "Succès",
        description: "Le lieu a été supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur", 
        description: error instanceof Error ? error.message : "Impossible de supprimer le lieu",
        variant: "destructive",
      });
    } finally {
      setPlaceToDelete(null);
    }
  };

  // Gestion de l'archivage
  const handleArchive = async () => {
    if (!placeToArchive) return;
    
    try {
      await onPlaceArchive(placeToArchive._id);
      toast({
        title: "Succès",
        description: "Le lieu a été archivé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'archiver le lieu",
        variant: "destructive",
      });
    } finally {
      setPlaceToArchive(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <PlaceCard
            key={place._id}
            place={place}
            onClick={() => onPlaceClick(place._id)}
            onDelete={() => setPlaceToDelete(place)}
            onArchive={() => setPlaceToArchive(place)}
            onEdit={() => onPlaceClick(place._id)}
          />
        ))}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!placeToDelete} onOpenChange={() => setPlaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {placeToDelete?.name.fr} ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation d'archivage */}
      <AlertDialog open={!!placeToArchive} onOpenChange={() => setPlaceToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l&apos;archivage</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver {placeToArchive?.name.fr} ?
              Le lieu ne sera plus visible mais pourra être restauré ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}