'use client';

import type { BlogPost } from '@/types/blog';

interface SearchResult {
  posts: BlogPost[];
  total: number;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

interface SearchParams {
  query: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export class BlogSearchService {
  public async search(params: SearchParams): Promise<SearchResult> {
    const response = await fetch('/api/blog/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    return response.json();
  }
} 