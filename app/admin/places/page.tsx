// app/admin/places/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlaceStats } from '@/components/admin/places/PlaceStats';
import { PlaceList } from '@/components/admin/places/PlaceList';
import { PlaceFilters } from '@/components/admin/places/PlaceFilters';
import { ImportWizard } from '@/components/admin/places/import/ImportWizard';
import { useToast } from '@/hooks/use-toast';
import { Category, Status } from '@/types/common';
import { usePlaces } from '@/hooks/usePlaces';
import { placeRepository } from '@/lib/repositories/place-repository';

export default function PlacesPage() {
  const router = useRouter();
  const { toast } = useToast();

  // États de filtrage et pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sortOrder] = useState<{field: string; order: 'asc' | 'desc'}>({
    field: 'updatedAt',
    order: 'desc'
  });

  // Utilisation du hook usePlaces avec tous les filtres
  const { 
    data,
    isLoading,
    error,
    refetch
  } = usePlaces({
    search: searchQuery,
    category: selectedCategories[0], // Fix type error by taking first category if any
    status: selectedStatus,
    page: currentPage,
    limit: 50,
    sort: { [sortOrder.field]: sortOrder.order === 'desc' ? -1 : 1 }
  });

  // Extraction des données avec des valeurs par défaut sécurisées
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

  // Gestion des filtres
  const handleFiltersChange = {
    categories: (cats: Category[]) => {
      setSelectedCategories(cats);
      setCurrentPage(1);
    },
    status: (stat: Status) => {
      setSelectedStatus(stat);
      setCurrentPage(1);
    },
    search: (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    },
    clearAll: () => {
      setSearchQuery('');
      setSelectedCategories([]);
      setSelectedStatus(undefined);
      setCurrentPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    await placeRepository.delete(id);
    await refetch();
  };

  // Gestion des actions
  const handleEdit = (id: string) => {
    router.push(`/admin/places/${id}`);
  };

  const handleImportComplete = async () => {
    setIsImportModalOpen(false);
    await refetch();
    toast({
      description: "Import terminé avec succès"
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Une erreur est survenue lors du chargement des lieux</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

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
            Importer
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
      <PlaceFilters
        searchValue={searchQuery}
        onSearchChange={handleFiltersChange.search}
        selectedFilters={{
          categories: selectedCategories,
          status: selectedStatus ? [selectedStatus] : [],
        }}
        onFilterChange={(type, value) => {
          if (type === 'categories') handleFiltersChange.categories(value as Category[]);
          if (type === 'status') handleFiltersChange.status(value[0] as Status);
        }}
        onClearFilters={handleFiltersChange.clearAll}
      />

      {/* Liste des lieux */}
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

      {/* Modal d'import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import de lieux</DialogTitle>
          </DialogHeader>
          <ImportWizard
            onComplete={handleImportComplete}
            onCancel={() => setIsImportModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}