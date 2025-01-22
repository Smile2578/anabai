// hooks/blog/usePostActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Blog } from '@/types/blog';

type PostAction = 'publish' | 'archive' | 'delete';

interface PostActionParams {
  postId: string;
  action: PostAction;
  scheduledDate?: string;
}

export function usePostActions() {
  const queryClient = useQueryClient();

  const { mutate: updatePostStatus, isPending } = useMutation<Blog, Error, PostActionParams>({
    mutationFn: async ({ postId, action, scheduledDate }: PostActionParams) => {
      const supabase = createClient();

      if (action === 'publish') {
        const { data, error } = await supabase
          .from('blogs')
          .update({ 
            status: 'published',
            published_at: scheduledDate || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', postId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      if (action === 'archive') {
        const { data, error } = await supabase
          .from('blogs')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .eq('id', postId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('blogs')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        return null;
      }

      throw new Error('Action non valide');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      
      const messages = {
        publish: "L'article a été publié avec succès",
        archive: "L'article a été archivé avec succès",
        delete: "L'article a été supprimé avec succès"
      };

      toast({
        title: "Succès",
        description: messages[variables.action],
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