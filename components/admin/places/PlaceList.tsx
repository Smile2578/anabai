// components/admin/places/PlaceList.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category, Status } from '@/types/common';
import { Place } from '@/types/places/main';
import { useRouter } from 'next/navigation';
import { FilterBar } from './FilterBar';
import { PlaceActions } from './PlaceActions';
import { Badge } from '@/components/ui/badge';
import { usePlaces } from '@/hooks/usePlaces';

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
  data: places,
  isLoading,
  error,
  onEdit,
  onDelete,
  pagination
}: PlaceListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>();
  const [status, setStatus] = useState<Status>();
  const [page, setPage] = useState(1);


  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    setPage(1);
  };

  const handleStatusChange = (value: Status) => {
    setStatus(value);
    setPage(1);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/places/${id}`);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Erreur lors du chargement des lieux : {error.message}
          </div>
        </CardContent>
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
              <TableHead>Préfecture</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière mise à jour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : places?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Aucun lieu trouvé
                </TableCell>
              </TableRow>
            ) : (
              places?.map((place: Place) => (
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

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {places.length} lieux trouvés
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

interface PlaceRowProps {
  place: Place;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}
function PlaceRow({ place, onEdit }: PlaceRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{place.name.fr}</div>
          <div className="text-sm text-gray-500">{place.name.ja}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{place.category}</Badge>
      </TableCell>
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