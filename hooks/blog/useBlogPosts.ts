// hooks/blog/useBlogPosts.ts
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Blog } from '@/types/blog';

export function useBlogPosts() {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      console.log('🔍 [useBlogPosts] Chargement des articles...');
      
      // 1. Récupérer les articles
      const { data: posts, error: postsError } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('❌ [useBlogPosts] Erreur lors du chargement des articles:', postsError);
        throw postsError;
      }

      if (!posts?.length) {
        console.log('ℹ️ [useBlogPosts] Aucun article trouvé');
        return [];
      }

      // 2. Récupérer les auteurs
      const authorIds = [...new Set(posts.map(post => post.author_id))];
      const { data: authors } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', authorIds);

      // 3. Récupérer les catégories
      const categoryIds = [...new Set(posts.map(post => post.category_id))];
      const { data: categories } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .in('id', categoryIds);

      // 4. Combiner les données
      const enrichedPosts = posts.map(post => ({
        ...post,
        author: authors?.find(author => author.id === post.author_id) || null,
        category: categories?.find(cat => cat.id === post.category_id) || null
      }));

      console.log('✅ [useBlogPosts] Articles chargés:', enrichedPosts.length);
      return enrichedPosts as Blog[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}