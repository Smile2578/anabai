import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';
import * as blogActions from '@/lib/actions/blog.actions';

export function useBlog(postId?: string) {
  const queryClient = useQueryClient();

  // Récupérer un article
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', postId],
    queryFn: () => postId ? blogActions.getBlogPost(postId) : null,
    enabled: Boolean(postId)
  });

  // Récupérer tous les articles
  const { data: posts = [] } = useQuery({
    queryKey: ['blog'],
    queryFn: blogActions.getBlogPosts
  });

  // Créer un article
  const createMutation = useMutation({
    mutationFn: blogActions.createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast({
        description: "L'article a été créé avec succès"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Erreur lors de la création de l'article"
      });
    }
  });

  // Mettre à jour un article
  const updateMutation = useMutation({
    mutationFn: ({ id, post }: { id: string; post: Partial<BlogPost> }) => 
      blogActions.updateBlogPost(id, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast({
        description: "L'article a été mis à jour avec succès"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Erreur lors de la mise à jour de l'article"
      });
    }
  });

  // Supprimer un article
  const deleteMutation = useMutation({
    mutationFn: blogActions.deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast({
        description: "L'article a été supprimé avec succès"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Erreur lors de la suppression de l'article"
      });
    }
  });

  // Publier un article
  const publishMutation = useMutation({
    mutationFn: blogActions.publishBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast({
        description: "L'article a été publié avec succès"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Erreur lors de la publication de l'article"
      });
    }
  });

  // Dépublier un article
  const unpublishMutation = useMutation({
    mutationFn: blogActions.unpublishBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast({
        description: "L'article a été dépublié avec succès"
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Erreur lors de la dépublication de l'article"
      });
    }
  });

  return {
    post,
    posts,
    isLoading,
    createPost: createMutation.mutate,
    updatePost: updateMutation.mutate,
    deletePost: deleteMutation.mutate,
    publishPost: publishMutation.mutate,
    unpublishPost: unpublishMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending
  };
} 