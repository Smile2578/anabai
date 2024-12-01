import { useState, useEffect, useCallback } from 'react';
import { BlogCacheService } from '@/lib/services/blog/BlogCacheService';
import { BlogPost } from '@/types/blog';

const blogCache = new BlogCacheService();

interface UsePostCacheResult {
  post: BlogPost | null;
  loading: boolean;
  error: string | null;
  incrementViews: () => Promise<void>;
}

export function usePostCache(slug: string): UsePostCacheResult {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cachedPost = await blogCache.getPost(slug);
        if (cachedPost) {
          setPost(cachedPost);
          return;
        }

        // Si pas en cache, charger depuis l'API
        const response = await fetch(`/api/blog/posts/${slug}`);
        if (!response.ok) throw new Error('Article non trouvé');
        
        const fetchedPost = await response.json();
        await blogCache.setPost(slug, fetchedPost);
        setPost(fetchedPost);
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
      try {
        const views = await blogCache.incrementViews(slug);
        setPost(prev => prev ? { ...prev, views } : null);
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues:', error);
      }
    }
  }, [post, slug]);

  return {
    post,
    loading,
    error,
    incrementViews,
  };
}

interface UseRecentPostsResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
}

export function useRecentPosts(limit: number = 5): UseRecentPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cachedPosts = await blogCache.getRecentPosts(limit);
        if (cachedPosts.length > 0) {
          setPosts(cachedPosts);
          return;
        }

        // Si pas en cache, charger depuis l'API
        const response = await fetch(`/api/blog/posts/recent?limit=${limit}`);
        if (!response.ok) throw new Error('Erreur lors du chargement des articles récents');
        
        const fetchedPosts = await response.json();
        await blogCache.warmupCache(fetchedPosts);
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, [limit]);

  return {
    posts,
    loading,
    error,
  };
}

interface UsePopularPostsResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
}

export function usePopularPosts(limit: number = 5): UsePopularPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cachedPosts = await blogCache.getPopularPosts(limit);
        if (cachedPosts.length > 0) {
          setPosts(cachedPosts);
          return;
        }

        // Si pas en cache, charger depuis l'API
        const response = await fetch(`/api/blog/posts/popular?limit=${limit}`);
        if (!response.ok) throw new Error('Erreur lors du chargement des articles populaires');
        
        const fetchedPosts = await response.json();
        await blogCache.warmupCache(fetchedPosts);
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, [limit]);

  return {
    posts,
    loading,
    error,
  };
} 