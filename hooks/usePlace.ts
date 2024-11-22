// hooks/usePlace.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Place } from '@/types/places/main';
import { useToast } from '@/hooks/use-toast';

interface UsePlaceResult {
  place: Place | null;
  isLoading: boolean;
  error: Error | null;
  updatePlace: (updates: Partial<Place>) => Promise<void>;
  deletePlace: () => Promise<void>;
}

async function fetchPlace(id: string): Promise<Place> {
  const response = await fetch(`/api/admin/places/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch place');
  }
  return response.json();
}

async function updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
  const response = await fetch(`/api/admin/places/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update place');
  }
  return response.json();
}

async function deletePlace(id: string): Promise<void> {
  const response = await fetch(`/api/admin/places/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete place');
  }
}

export function usePlace(id: string): UsePlaceResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query pour récupérer le lieu
  const { data: place, isLoading, error } = useQuery<Place, Error>({
    queryKey: ['place', id],
    queryFn: () => fetchPlace(id),
    staleTime: 30 * 1000, // 30 secondes
  });

  // Mutation pour mettre à jour le lieu
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Place>) => updatePlace(id, updates),
    onSuccess: (updatedPlace) => {
      // Mise à jour du cache
      queryClient.setQueryData(['place', id], updatedPlace);
      // Invalider la liste des lieux
      queryClient.invalidateQueries({ queryKey: ['places'] });
      
      toast({
        title: "Lieu mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le lieu.",
        variant: "destructive",
      });
      console.error('Error updating place:', error);
    },
  });

  // Mutation pour supprimer le lieu
  const deleteMutation = useMutation({
    mutationFn: () => deletePlace(id),
    onSuccess: () => {
      // Invalider toutes les queries liées aux lieux
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.removeQueries({ queryKey: ['place', id] });
      
      toast({
        title: "Lieu supprimé",
        description: "Le lieu a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lieu.",
        variant: "destructive",
      });
      console.error('Error deleting place:', error);
    },
  });

  return {
    place: place || null,
    isLoading,
    error: error || null,
    updatePlace: async (updates: Partial<Place>) => {
      await updateMutation.mutateAsync(updates);
    },
    deletePlace: deleteMutation.mutateAsync,
  };
}