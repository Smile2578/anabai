// components/admin/places/PlaceActions.tsx
import { MoreHorizontal, Edit, Trash, Eye, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Place } from '@/types/places/main';
import { usePlaceActions } from '@/hooks/usePlaceActions';
import { ConfirmDialog } from './ConfirmDialog';

interface PlaceActionsProps {
  place: Place;
  onEdit: () => void;
}

export function PlaceActions({ place, onEdit }: PlaceActionsProps) {
  const {
    deletePlace,
    toggleStatus,
    toggleGem,
    isLoading,
    dialog
  } = usePlaceActions(place._id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleStatus(place.metadata.status)}>
            <Eye className="mr-2 h-4 w-4" />
            {place.metadata.status === 'publié' ? 'Archiver' : 'Publier'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleGem()}>
            <Star className="mr-2 h-4 w-4" />
            {place.isGem ? 'Retirer des gems' : 'Ajouter aux gems'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => deletePlace()}
            disabled={isLoading}
          >
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        options={dialog.options}
        onClose={dialog.handleClose}
        onConfirm={dialog.handleConfirm}
      />
    </>
  );
}