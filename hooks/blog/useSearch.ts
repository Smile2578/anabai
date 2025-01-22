// hooks/blog/useSearch.ts
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';


interface SearchParams {
  query: string;
  tags?: string[];
  page?: number;
  limit?: number;
  status?: string;
}

export function useSearch() {
  const [state, setState] = useState<{
    posts: Blog[];
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      totalPages: number;
      totalItems: number;
    };
  }>({
    posts: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 0,
      totalItems: 0,
    },
  });

  const search = useCallback(async (params: SearchParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const supabase = createClient();

    try {
      let query = supabase
        .from('blogs')
        .select('*', { count: 'exact' });

      // Recherche textuelle
      if (params.query) {
        query = query.or(`title->fr.ilike.%${params.query}%,content->fr.ilike.%${params.query}%,excerpt->fr.ilike.%${params.query}%`);
      }

      // Filtrage par tags
      if (params.tags && params.tags.length > 0) {
        query = query.contains('tags', params.tags);
      }

      // Filtrage par status
      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Pagination
      const from = ((params.page || 1) - 1) * (params.limit || 10);
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + (params.limit || 10) - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setState({
        posts: data as Blog[],
        loading: false,
        error: null,
        pagination: {
          page: params.page || 1,
          totalPages: Math.ceil((count || 0) / (params.limit || 10)),
          totalItems: count || 0,
        },
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
    }
  }, []);

  return {
    ...state,
    search,
  };
}