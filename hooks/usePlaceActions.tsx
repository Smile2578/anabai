// components/admin/places/hooks/usePlaceActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Status } from '@/types/common';
import { toast } from 'sonner';

export function usePlaceActions(placeId: string) {
  const queryClient = useQueryClient();

  const { mutate: deletePlace, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/places/${placeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Lieu supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression : ' + error.message);
    }
  });

  const { mutate: toggleStatus, isPending: isTogglingStatus } = useMutation({
    mutationFn: async (newStatus: Status) => {
      const response = await fetch(`/api/admin/places/${placeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'metadata.status': newStatus })
      });
      if (!response.ok) throw new Error('Erreur lors du changement de statut');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Statut mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors du changement de statut : ' + error.message);
    }
  });

  const { mutate: toggleGem, isPending: isTogglingGem } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/places/${placeId}/gem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erreur lors du changement de statut gem');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Statut gem mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors du changement de statut gem : ' + error.message);
    }
  });

  return {
    deletePlace,
    toggleStatus,
    toggleGem,
    isLoading: isDeleting || isTogglingStatus || isTogglingGem
  };
}