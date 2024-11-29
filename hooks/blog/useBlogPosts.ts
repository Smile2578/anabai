import { useQuery } from '@tanstack/react-query';
import { BlogPostPreview } from '@/types/blog';

async function fetchBlogPosts(): Promise<BlogPostPreview[]> {
  const response = await fetch('/api/admin/blog');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des articles');
  }
  return response.json();
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
  });
} 