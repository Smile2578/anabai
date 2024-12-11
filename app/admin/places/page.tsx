// app/admin/places/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceStats } from '@/components/admin/places/PlaceStats';
import { PlaceList } from '@/components/admin/places/PlaceList';
import { PlaceFilters } from '@/components/admin/places/PlaceFilters';
import { CreatePlaceDialog } from '@/components/admin/places/create/CreatePlaceDialog';
import { useToast } from '@/hooks/use-toast';
import { usePlaces } from '@/hooks/usePlaces';
import { Category, Status } from '@/types/common';
import { placeRepository } from '@/lib/repositories/place-repository';

// Interface pour la structure des filtres
interface PlaceFilters {
  categories: Category[];
  status: Status[];
  priceRange: number[];
}

// Valeurs par défaut pour les statistiques
const defaultStats = {
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

export default function PlacesPage() {
  // Initialisation des hooks nécessaires
  const router = useRouter();
  const { toast } = useToast();

  // États locaux pour la gestion des modales et des filtres
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PlaceFilters>({
    categories: [],
    status: [],
    priceRange: []
  });
  
  // Utilisation du hook usePlaces pour récupérer les données
  // avec gestion optimisée du cache et des requêtes
  const { 
    places,
    stats,
    totalPages,
    isLoading,
    error,
    refetch
  } = usePlaces({
    search: searchQuery,
    categories: filters.categories,
    status: filters.status[0],
    page: currentPage,
    limit: 50
  });

  // Gestionnaire de changement des filtres
  const handleFilterChange = (
    type: 'categories' | 'status' | 'priceRange',
    value: Category[] | Status[] | number[]
  ) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  // Réinitialisation complète des filtres et de la recherche
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      priceRange: []
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Gestion de la suppression d'un lieu
  const handleDelete = async (id: string) => {
    try {
      await placeRepository.delete(id);
      // Après la suppression, on force le rechargement des données
      await refetch();
      toast({
        description: "Le lieu a été supprimé avec succès"
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du lieu:', err);
      toast({
        variant: "destructive",
        description: "Erreur lors de la suppression du lieu"
      });
    }
  };

  // Navigation vers la page d'édition d'un lieu
  const handleEdit = (id: string) => {
    router.push(`/admin/places/${id}`);
  };

  // Gestion du succès de la création d'un lieu
  const handleCreateSuccess = async (placeId: string) => {
    setIsCreateModalOpen(false);
    await refetch();
    router.push(`/admin/places/${placeId}`);
    toast({
      description: "Le lieu a été créé avec succès"
    });
  };


  // Affichage d'un message d'erreur si nécessaire
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
      {/* En-tête avec bouton d'ajout */}
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

      {/* Statistiques globales */}
      <PlaceStats stats={stats || defaultStats} />

      {/* Barre de filtres */}
      <PlaceFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Liste des lieux avec gestion du chargement */}
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

      {/* Modal de création */}
      <CreatePlaceDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}