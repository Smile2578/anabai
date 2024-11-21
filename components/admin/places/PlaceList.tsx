// components/admin/places/PlaceList.tsx
import { useState, useEffect } from 'react';
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
import { Category, Status } from '@/types/common';
import { Place } from '@/types/places/main';
import { PlaceActions } from './PlaceActions';
import { Badge } from '@/components/ui/badge';


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
  isLoading,
  error,
  onEdit,
  onDelete,
  pagination
}: PlaceListProps) {

  const [search] = useState('');
  const [category] = useState<Category>();
  const [status] = useState<Status>();
  const [page] = useState(1);
  const [fetchedPlaces, setFetchedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', '50');

        const response = await fetch(`/api/admin/places?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des lieux');
        }
        const data = await response.json();
        setFetchedPlaces(data.places);
      } catch (err) {
        setFetchError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [search, category, status, page]);



  if (fetchError || error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Erreur lors du chargement des lieux : {(fetchError || error)?.message}
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
            {loading || isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : fetchedPlaces?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Aucun lieu trouvé
                </TableCell>
              </TableRow>
            ) : (
              fetchedPlaces?.map((place: Place) => (
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
          {fetchedPlaces.length} lieux trouvés
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