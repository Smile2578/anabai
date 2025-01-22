'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { Blog, BlogCategory } from '@/types/blog';

interface BlogPageData {
  featuredPosts: Blog[];
  recentPosts: Blog[];
  categories: BlogCategory[];
  isLoading: boolean;
  error: Error | null;
}

export function useBlogPage(): BlogPageData & {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
} {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<Blog[]>([]);
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les articles mis en avant
        const { data: featuredPosts, error: featuredError } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('published_at', { ascending: false });

        if (featuredError) throw featuredError;

        // Récupérer les articles récents non mis en avant
        const { data: recentPosts, error: recentError } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'published')
          .eq('is_featured', false)
          .order('published_at', { ascending: false })
          .limit(9);

        if (recentError) throw recentError;

        // Récupérer les catégories
        const { data: categories, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('id, name, description, slug, parent_id, order_index, created_at, updated_at')
          .order('order_index', { ascending: true })
          .order('name->fr', { ascending: true });

        if (categoriesError) throw categoriesError;

        // Enrichir les articles mis en avant avec les auteurs et catégories
        const enrichedFeaturedPosts = await Promise.all((featuredPosts || []).map(async (post) => {
          const [{ data: author }, { data: category }] = await Promise.all([
            supabase
              .from('users')
              .select('id, name, email')
              .eq('id', post.author_id)
              .single(),
            supabase
              .from('blog_categories')
              .select('id, name, description, slug')
              .eq('id', post.category_id)
              .single()
          ]);

          return {
            ...post,
            author: author || null,
            category: category || null
          };
        }));

        // Enrichir les articles récents avec les auteurs et catégories
        const enrichedRecentPosts = await Promise.all((recentPosts || []).map(async (post) => {
          const [{ data: author }, { data: category }] = await Promise.all([
            supabase
              .from('users')
              .select('id, name, email')
              .eq('id', post.author_id)
              .single(),
            supabase
              .from('blog_categories')
              .select('id, name, description, slug')
              .eq('id', post.category_id)
              .single()
          ]);

          return {
            ...post,
            author: author || null,
            category: category || null
          };
        }));

        setFeaturedPosts(enrichedFeaturedPosts);
        setRecentPosts(enrichedRecentPosts);
        setCategories(categories || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  return {
    featuredPosts,
    recentPosts,
    categories,
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId
  };
} 