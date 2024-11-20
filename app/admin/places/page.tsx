// app/admin/places/page.tsx
'use client';

import { useState } from 'react';
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
import { PlaceList } from '@/components/admin/places/PlaceList';
import { ImportWizard } from '@/components/admin/places/import/ImportWizard';
import { useToast } from '@/hooks/use-toast';
import { Category, Status } from '@/types/common';
import { usePlaces } from '@/hooks/usePlaces';



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
  const router = useRouter();
  const { toast } = useToast();

  // États de filtrage et pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<Status | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Utilisation du hook usePlaces avec les bons types
  const { 
    data,
    isLoading,
    error 
  } = usePlaces({
    search: searchQuery,
    category: selectedCategory,
    status: selectedStatus,
    page: currentPage,
    limit: 20
  });

  // Extraction des données avec des valeurs par défaut
  const places = data?.places || [];
  const stats = data?.stats || defaultStats;
  const totalPages = data?.totalPages || 1;

  // Gestion des actions sur les lieux
  const handleEdit = (id: string) => {
    router.push(`/admin/places/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/places/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      toast({
        description: "Le lieu a été supprimé avec succès"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Impossible de supprimer le lieu"
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

      {/* Filtres et liste */}
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {/* Ici vous pouvez ajouter vos autres filtres */}
        </div>

        <PlaceList
          data={places}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
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
            }}
            onCancel={() => setIsImportModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}