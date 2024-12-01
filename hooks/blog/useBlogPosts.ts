// hooks/blog/useBlogPosts.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BlogPostPreview } from '@/types/blog';

async function fetchBlogPosts(): Promise<BlogPostPreview[]> {
  const response = await fetch('/api/admin/blog');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des articles');
  }
  return response.json();
}

export function useBlogPosts() {
  const queryClient = useQueryClient();

  return useQuery<BlogPostPreview[]>({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
    staleTime: 0, // Force le rafraîchissement à chaque fois
    refetchOnMount: true, // Rafraîchit à chaque montage
    refetchOnWindowFocus: true, // Rafraîchit quand la fenêtre reprend le focus
  });
}