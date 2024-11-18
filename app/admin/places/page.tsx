// app/admin/places/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceStats } from '@/components/admin/places/PlaceStats';
import { FilterBar } from '@/components/admin/places/FilterBar';
import { ImportModal } from '@/components/admin/places/ImportModal';
import { PlaceCard } from '@/components/admin/places/PlaceCard';
import { toast } from '@/hooks/use-toast';
import { Place } from '@/types/place';
import { CATEGORIES } from '@/lib/constants';

type Status = 'brouillon' | 'publié' | 'archivé';

export default function PlacesPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    status: [] as Status[]
  });
  
  // État pour le modal d'import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // États pour la liste
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });

  const fetchPlaces = async () => {
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

      const response = await fetch(`/api/admin/places?${queryParams}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des lieux');
      
      const data = await response.json();
      setPlaces(data.places);
      setStats({
        total: data.stats?.total || 0,
        published: data.stats?.published || 0,
        draft: data.stats?.draft || 0,
        archived: data.stats?.archived || 0
      });
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
  };

  useEffect(() => {
    fetchPlaces();
  }, [searchValue, selectedFilters]);

  // Gestion des filtres
  const handleFilterChange = (type: 'categories' | 'status', value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value as Status)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value as Status]
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      categories: [],
      status: []
    });
    setSearchValue('');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
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

      <PlaceStats stats={stats} />

      <div className="space-y-6">
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={{
            categories: [...CATEGORIES],
            status: ['brouillon', 'publié', 'archivé']
          }}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place._id}
                place={place}
                onClick={() => router.push(`/admin/places/${place._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRefresh={fetchPlaces}
      />
    </div>
  );
}