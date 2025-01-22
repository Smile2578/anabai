// lib/services/blog/BlogCacheService.ts
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';

export class BlogCacheService {
  static async getPost(slug: string): Promise<Blog | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du post:', error);
      return null;
    }

    return data;
  }

  static async getPosts(limit: number = 10): Promise<Blog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      return [];
    }

    return data;
  }

  static async incrementViews(postId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('increment_blog_views', {
      blog_id: postId
    });

    if (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  }

  static async getPopularPosts(limit: number = 5): Promise<Blog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*, blog_views(view_count)')
      .eq('status', 'published')
      .order('blog_views(view_count)', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération des posts populaires:', error);
      return [];
    }

    return data;
  }
}