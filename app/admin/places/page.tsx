// app/admin/places/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlaceStats } from '@/components/admin/places/PlaceStats';
import { PlaceFilters } from '@/components/admin/places/PlaceFilters';
import { PlaceList } from '@/components/admin/places/PlaceList';
import { ImportWizard } from '@/components/admin/places/import/ImportWizard';
import { useToast } from '@/hooks/use-toast';
import { Place } from '@/types/places/main';
import { Category, Status } from '@/types/common';

type FilterType = 'categories' | 'status' | 'priceRange';
type FilterValue = Category | Status | number;

export default function PlacesPage() {
  const router = useRouter();
  const { toast } = useToast();

  // États
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    categories: Category[];
    status: Status[];
    priceRange: number[];
  }>({
    categories: [],
    status: [],
    priceRange: []
  });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    withImages: 0,
    withoutImages: 0,
    totalRatings: 0,
    averageRating: 0,
    byCategory: {},
    byPrefecture: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les lieux
  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const queryParams = new URLSearchParams();
      if (searchValue) queryParams.append('search', searchValue);
      if (selectedFilters.categories.length > 0) {
        queryParams.append('category', selectedFilters.categories.join(','));
      }
      if (selectedFilters.status.length > 0) {
        queryParams.append('status', selectedFilters.status.join(','));
      }
      if (selectedFilters.priceRange.length > 0) {
        queryParams.append('priceRange', selectedFilters.priceRange.join(','));
      }

      const response = await fetch(`/api/admin/places?${queryParams}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des lieux');
      
      const data = await response.json();
      setPlaces(data.places);
      setStats(data.stats);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les lieux",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchValue, selectedFilters, toast]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Gestion des filtres
  const handleFilterChange = (type: FilterType, value: FilterValue) => {
    setSelectedFilters(prev => {
      const currentValues = prev[type];
      const valueExists = currentValues.includes(value as never);
      
      return {
        ...prev,
        [type]: valueExists
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      categories: [],
      status: [],
      priceRange: []
    });
    setSearchValue('');
  };

  // Gestion des actions sur les lieux
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/places/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
      
      await fetchPlaces();
      toast({
        title: "Succès",
        description: "Le lieu a été supprimé"
      });
    } catch (error) {
      console.error('Error deleting place:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le lieu",
        variant: "destructive"
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/places/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          metadata: { status: 'archivé' }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'archivage');
      }
      
      await fetchPlaces();
      toast({
        title: "Succès",
        description: "Le lieu a été archivé"
      });
    } catch (error) {
      console.error('Error archiving place:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'archiver le lieu",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des lieux</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            Importer CSV
          </Button>
          <Button onClick={() => router.push('/admin/places/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau lieu
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <PlaceStats stats={stats} />

      {/* Filtres */}
      <div className="space-y-6">
        <PlaceFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedFilters={selectedFilters}
          onFilterChange={(type: string, value: Category[] | number[] | Status[]) => handleFilterChange(type as FilterType, value as unknown as FilterValue)}
          onClearFilters={handleClearFilters}
        />

        {/* Liste des lieux */}
        <PlaceList
          places={places}
          onPlaceClick={(id) => router.push(`/admin/places/${id}`)}
          onPlaceDelete={handleDelete}
          onPlaceArchive={handleArchive}
          isLoading={isLoading}
        />
      </div>

      {/* Modal d'import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import de lieux</DialogTitle>
          </DialogHeader>
          <ImportWizard
            onComplete={() => {
              setIsImportModalOpen(false);
              fetchPlaces();
            }}
            onCancel={() => setIsImportModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}