import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../use-toast';

type PostAction = 'publish' | 'archive' | 'delete';

interface PostActionParams {
  postId: string;
  action: PostAction;
  scheduledDate?: string;
}

export function usePostActions() {
  const queryClient = useQueryClient();

  const { mutate: updatePostStatus, isPending } = useMutation({
    mutationFn: async ({ postId, action, scheduledDate }: PostActionParams) => {
      const response = await fetch(`/api/admin/blog/${postId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, scheduledDate }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          // Invalider le cache car l'article n'existe plus
          queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        }
        throw new Error(data.error || 'Une erreur est survenue');
      }

      return data;
    },
    onSuccess: () => {
      // Invalider le cache pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Succès",
        description: "L'article a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    updatePostStatus,
    isLoading: isPending
  };
} 