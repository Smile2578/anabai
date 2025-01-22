'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRedisCacheService } from '@/lib/services/core/RedisCacheService';

let searchCache: Awaited<ReturnType<typeof createRedisCacheService>>;

async function getSearchCache() {
  if (!searchCache) {
    searchCache = await createRedisCacheService({
      prefix: 'blog:search:',
      ttl: 3600 // 1 heure
    });
  }
  return searchCache;
}

export async function POST(request: Request) {
  try {
    const { query, tags = [], page = 1, limit = 10 } = await request.json();
    const cacheKey = `${query}:${tags.sort().join(',')}:${page}:${limit}`;

    // Vérifier le cache
    const cache = await getSearchCache();
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Si pas en cache, effectuer la recherche
    const supabase = await createClient();
    let queryBuilder = supabase
      .from('blogs')
      .select('*, author:profiles(name, email)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`title->fr.ilike.%${query}%,content->fr.ilike.%${query}%`);
    }

    if (tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags);
    }

    const { data: posts, count, error } = await queryBuilder
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const result = {
      posts,
      total: count || 0,
      pagination: {
        page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0
      }
    };

    // Mettre en cache le résultat
    await cache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la recherche' },
      { status: 500 }
    );
  }
}