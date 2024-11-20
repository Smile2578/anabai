// hooks/usePlaceActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Status } from '@/types/common';
import { toast } from '@/hooks/use-toast';

export function usePlaceActions(placeId: string) {
  const queryClient = useQueryClient();

  const deletePlace = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/places/${placeId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ description: "Le lieu a été supprimé avec succès" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Impossible de supprimer le lieu"
      });
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async (newStatus: Status) => {
      const response = await fetch(`/api/admin/places/${placeId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          metadata: { status: newStatus }
        })
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ description: "Le statut a été mis à jour avec succès" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Impossible de mettre à jour le statut"
      });
    }
  });

  const toggleGem = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/places/${placeId}/gem`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ description: "Les gems ont été mises à jour avec succès" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Impossible de mettre à jour les gems"
      });
    }
  });

  return {
    deletePlace: deletePlace.mutate,
    toggleStatus: toggleStatus.mutate,
    toggleGem: toggleGem.mutate,
    isLoading: deletePlace.isPending || toggleStatus.isPending || toggleGem.isPending
  };
}