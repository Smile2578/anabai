// components/admin/places/PlaceList.tsx

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Place } from '@/types/places/main';
import { PlaceActions } from './PlaceActions';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Interfaces pour les props
export interface PlaceListProps {
  data: Place[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function PlaceList({
  data,
  isLoading,
  error,
  onEdit,
  onDelete,
  pagination
}: PlaceListProps) {
  // Si une erreur survient, on affiche un message d'erreur
  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-red-500">
          Erreur lors du chargement des lieux : {error.message}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Sous-catégorie</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Préfecture</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière mise à jour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Aucun lieu trouvé
                </TableCell>
              </TableRow>
            ) : (
              data?.map((place) => (
                <PlaceRow 
                  key={place._id} 
                  place={place} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {data?.length} lieux trouvés
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant PlaceRow pour afficher une ligne du tableau
interface PlaceRowProps {
  place: Place;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

function PlaceRow({ place, onEdit }: PlaceRowProps) {
  const router = useRouter();
  
  return (
    <TableRow key={place._id} className="group">
      <TableCell>
        <div 
          className="cursor-pointer" 
          onClick={() => router.push(`/admin/places/${place._id}`)}
        >
          <div className="font-medium group-hover:text-primary transition-colors">
            {place.name.fr}
          </div>
          <div className="text-sm text-gray-500">
            {place.name.ja}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{place.category}</Badge>
      </TableCell>
      <TableCell>{place.subcategories.join(', ')}</TableCell>
      <TableCell>{place.location.address.city}</TableCell>
      <TableCell>{place.location.address.prefecture}</TableCell>
      <TableCell>
        <Badge 
          variant={
            place.metadata.status === 'publié' ? 'outline' :
            place.metadata.status === 'brouillon' ? 'default' :
            'secondary'
          }
        >
          {place.metadata.status}
        </Badge>
      </TableCell>
      <TableCell>
        {new Date(place.updatedAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <PlaceActions 
          place={place} 
          onEdit={() => onEdit(place._id)}
        />
      </TableCell>
    </TableRow>
  );
}