import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { toast } from '@/hooks/use-toast';
import type { Blog, CreateBlogInput, UpdateBlogInput } from '@/types/blog';

export function useBlog(slug?: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: blog, isLoading } = useQuery<Blog>({
    queryKey: ['blog', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const createBlog = useMutation<Blog, Error, CreateBlogInput>({
    mutationFn: async (input: CreateBlogInput) => {
      const { data, error } = await supabaseAdmin
        .from('blogs')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Succès",
        description: "L'article a été créé avec succès",
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

  const updateBlog = useMutation<Blog, Error, UpdateBlogInput>({
    mutationFn: async ({ id, ...input }: UpdateBlogInput) => {
      const { data, error } = await supabaseAdmin
        .from('blogs')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog', data.slug] });
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
    blog,
    isLoading,
    createBlog: createBlog.mutate,
    updateBlog: updateBlog.mutate,
    isCreating: createBlog.isPending,
    isUpdating: updateBlog.isPending,
  };
} 