// hooks/blog/usePostCache.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';

interface UsePostCacheResult {
  post: Blog | null;
  loading: boolean;
  error: string | null;
  incrementViews: () => Promise<void>;
}

export function usePostCache(slug: string): UsePostCacheResult {
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const incrementViews = useCallback(async () => {
    if (post) {
      const supabase = createClient();
      try {
        const { error } = await supabase.rpc('increment_blog_views', {
          blog_id: post.id
        });
        if (error) throw error;
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues:', error);
      }
    }
  }, [post]);

  return {
    post,
    loading,
    error,
    incrementViews,
  };
}