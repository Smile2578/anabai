// app/admin/places/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlaceStats } from '@/components/admin/places/PlaceStats';
import { PlaceList } from '@/components/admin/places/PlaceList';
import { PlaceFilters } from '@/components/admin/places/PlaceFilters';
import { CreatePlaceDialog } from '@/components/admin/places/create/CreatePlaceDialog';
import { ImportWizard } from '@/components/admin/places/import/ImportWizard';
import { useToast } from '@/hooks/use-toast';
import { usePlaces } from '@/hooks/usePlaces';
import { Category, Status } from '@/types/common';
import { placeRepository } from '@/lib/repositories/place-repository';

interface PlaceFilters {
  categories: Category[];
  status: Status[];
  priceRange: number[];
}


export default function PlacesPage() {
  const router = useRouter();
  const { toast } = useToast();

  // États
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories] = useState<Category[]>([]);
  const [selectedStatus] = useState<Status>();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Données et chargement
  const { 
    data,
    isLoading,
    error,
    refetch
  } = usePlaces({
    search: searchQuery,
    category: selectedCategories[0],
    status: selectedStatus,
    page: currentPage,
    limit: 50
  });

  const places = data?.places || [];
  const stats = data?.stats || {
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
  };
  const totalPages = data?.totalPages || 1;

  const [filters, setFilters] = useState<PlaceFilters>({
    categories: [],
    status: [],
    priceRange: []
  });

  // Handler des filtres
  const handleFilterChange = (
    type: 'categories' | 'status' | 'priceRange',
    value: Category[] | Status[] | number[]
  ) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1); // Reset pagination when filters change
  };

  // Handler de nettoyage
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      priceRange: []
    });
    setSearchQuery('');
    setCurrentPage(1);
  };


  const handleDelete = async (id: string) => {
    try {
      await placeRepository.delete(id);
      await refetch();
      toast({
        description: "Le lieu a été supprimé avec succès"
      });
    } catch {
      toast({
        variant: "destructive",
        description: "Erreur lors de la suppression du lieu"
      });
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/places/${id}`);
  };

  const handleCreateSuccess = (placeId: string) => {
    setIsCreateModalOpen(false);
    refetch();
    router.push(`/admin/places/${placeId}`);
    toast({
      description: "Le lieu a été créé avec succès"
    });
  };

  const handleImportComplete = async () => {
    setIsImportModalOpen(false);
    await refetch();
    toast({
      description: "Import terminé avec succès"
    });
  };

  // Gestion de l'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Une erreur est survenue lors du chargement des lieux</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des lieux</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau lieu
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <PlaceStats stats={stats} />

      {/* Filtres */}
      <PlaceFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <PlaceList
          data={places}
          isLoading={isLoading}
          error={error as Error | null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      )}

      {/* Modal de création */}
      <CreatePlaceDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal d'import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <ImportWizard
            onComplete={handleImportComplete}
            onCancel={() => setIsImportModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}