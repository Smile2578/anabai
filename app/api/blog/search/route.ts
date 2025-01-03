'use server';

import { NextResponse } from 'next/server';
import { createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';
import type { FilterQuery } from 'mongoose';
import type { BlogPost as BlogPostType } from '@/types/blog';

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
    await connectDB();

    const filter: FilterQuery<BlogPostType> = { status: 'published' };
    if (query) {
      filter.$or = [
        { 'title.fr': { $regex: query, $options: 'i' } },
        { 'content.fr': { $regex: query, $options: 'i' } },
      ];
    }
    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter)
    ]);

    const result = {
      posts: JSON.parse(JSON.stringify(posts)),
      total,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
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