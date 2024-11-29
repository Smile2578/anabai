import { useState, useEffect, useCallback } from 'react';
import type { BlogPost } from '@/types/blog';

interface SearchState {
  query: string;
  selectedTags: string[];
  page: number;
  limit: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseSearchResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  search: (query: string) => void;
  selectTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setPage: (page: number) => void;
}

const defaultPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export function useSearch(): UseSearchResult {
  const [state, setState] = useState<SearchState>({
    query: '',
    selectedTags: [],
    page: 1,
    limit: 10,
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPagination);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire l'URL avec les paramètres de recherche
      const params = new URLSearchParams();
      if (state.query) params.append('q', state.query);
      state.selectedTags.forEach(tag => params.append('tags[]', tag));
      params.append('page', state.page.toString());
      params.append('limit', state.limit.toString());

      const response = await fetch(`/api/blog/search?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche');

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setPosts([]);
      setPagination(defaultPagination);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const search = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, page: 1 }));
  }, []);

  const selectTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: [...prev.selectedTags, tag],
      page: 1,
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag),
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  return {
    posts,
    loading,
    error,
    pagination,
    search,
    selectTag,
    removeTag,
    setPage,
  };
} 