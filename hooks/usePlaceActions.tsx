// hooks/usePlaceActions.tsx
import { useState } from 'react';
import { Status } from '@/types/common';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useDialog } from '@/hooks/places/useDialog';

export function usePlaceActions(placeId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const dialog = useDialog();

  const handleApiCall = async (
    apiCall: () => Promise<Response>,
    successMessage: string
  ) => {
    setIsLoading(true);
    try {
      const response = await apiCall();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Erreur lors de l'opération (${response.status}): ${response.statusText}`
        );
      }

      const data = await response.json();

      // Invalider toutes les requêtes liées aux places
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return queryKey === 'places' || 
                 queryKey === 'placeStats' || 
                 (Array.isArray(queryKey) && queryKey[0] === 'place');
        }
      });

      // Forcer le rechargement immédiat
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: ['places'],
          type: 'all'
        }),
        queryClient.refetchQueries({ 
          queryKey: ['placeStats'],
          type: 'all'
        })
      ]);

      toast({
        title: "Succès",
        description: successMessage
      });

      return data;
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (currentStatus: Status) => {
    const newStatus: Status = currentStatus === 'publié' ? 'archivé' : 'publié';
    
    await handleApiCall(
      () => fetch(`/api/admin/places/${placeId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      }),
      `Le lieu a été ${newStatus === 'publié' ? 'publié' : 'archivé'}`
    );
  };

  const toggleGem = async () => {
    await handleApiCall(
      () => fetch(`/api/admin/places/${placeId}/gem`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        }
      }),
      "Le statut gem a été modifié"
    );
  };

  const deletePlace = async () => {
    const confirmed = await dialog.openDialog({
      title: "Confirmation de suppression",
      description: "Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.",
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "destructive"
    });

    if (confirmed) {
      await handleApiCall(
        () => fetch(`/api/admin/places/${placeId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json'
          }
        }),
        "Le lieu a été supprimé"
      );
    }
  };

  return {
    toggleStatus,
    toggleGem,
    deletePlace,
    isLoading,
    dialog
  };
}