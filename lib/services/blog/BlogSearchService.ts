// lib/services/blog/BlogSearchService.ts
import { createClient } from '@/lib/supabase/client';
import type { Blog } from '@/types/blog';

interface SearchParams {
  query?: string;
  tags?: string[];
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface SearchResult {
  posts: Blog[];
  total: number;
  totalPages: number;
}

export class BlogSearchService {
  static async search(params: SearchParams): Promise<SearchResult> {
    const supabase = createClient();
    const {
      query,
      tags,
      category,
      status = 'published',
      page = 1,
      limit = 10
    } = params;

    let queryBuilder = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('status', status);

    if (query) {
      queryBuilder = queryBuilder.or(
        `title->fr.ilike.%${query}%,content->fr.ilike.%${query}%,excerpt->fr.ilike.%${query}%`
      );
    }

    if (tags?.length) {
      queryBuilder = queryBuilder.contains('tags', tags);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const from = (page - 1) * limit;
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Erreur lors de la recherche:', error);
      return { posts: [], total: 0, totalPages: 0 };
    }

    return {
      posts: data,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
}