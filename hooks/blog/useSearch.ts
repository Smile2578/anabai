import { useState, useCallback } from 'react';
import { BlogSearchService } from '@/lib/services/blog/BlogSearchService';
import { BlogPost } from '@/types/blog';

interface SearchState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

const searchService = new BlogSearchService();

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    posts: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 0,
      totalItems: 0,
    },
  });

  const search = useCallback(async (
    query: string,
    tags: string[] = [],
    page: number = 1,
    limit: number = 10
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await searchService.search({
        query,
        tags,
        page,
        limit,
      });

      setState({
        posts: result.posts,
        loading: false,
        error: null,
        pagination: result.pagination,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
    }
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  return {
    ...state,
    search,
    setPage,
  };
} 