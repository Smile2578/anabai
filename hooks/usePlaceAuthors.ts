// hooks/usePlaceAuthors.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Place } from '@/types/places/main';

interface Author {
    id: string;
    name: string;
    role: 'admin' | 'editor';
    addedAt: Date;
  }
interface UpdateAuthorsParams {
  placeId: string;
  authors: Author[];
}

interface UpdateAuthorsResponse {
    success: boolean;
    authors: Author[];
}

export function usePlaceAuthors() {
  const queryClient = useQueryClient();

  // Mutation pour ajouter un auteur (POST)
  const addAuthor = useMutation({
    mutationFn: async ({ placeId, authorId }: { placeId: string, authorId: string }) => {
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId, authorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add author');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        description: "Auteur ajouté avec succès",
      });
      // Invalider le cache du lieu pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['place'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'auteur",
      });
    },
  });

  // Mutation pour mettre à jour les auteurs (PATCH)
  const updateAuthors = useMutation<UpdateAuthorsResponse, Error, UpdateAuthorsParams>({
    mutationFn: async ({ placeId, authors }: UpdateAuthorsParams) => {
      const response = await fetch('/api/admin/authors', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId, authors }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update authors');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        description: "Auteurs mis à jour avec succès",
      });
      
      // Invalider le cache du lieu
      queryClient.invalidateQueries({ queryKey: ['place'] });
      
      // Mettre à jour le cache avec les nouvelles données
      queryClient.setQueryData<Place>(['place', variables.placeId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          metadata: {
            ...oldData.metadata,
            authors: data.authors.map(author => ({
              ...author,
              addedAt: new Date(author.addedAt) // S'assurer que addedAt est bien une Date
            }))
          }
        };
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour des auteurs",
      });
    },
  });

  return {
    addAuthor: addAuthor.mutate,
    isAdding: addAuthor.isPending,
    updateAuthors: updateAuthors.mutate,
    isUpdating: updateAuthors.isPending,
  };
}