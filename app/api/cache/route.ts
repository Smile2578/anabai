// app/api/cache/route.ts

import { NextResponse } from 'next/server';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';

let apiCache: RedisCacheService | null = null;

async function getCache(): Promise<RedisCacheService> {
  if (!apiCache) {
    apiCache = await createRedisCacheService({
      prefix: 'api:',
      ttl: 3600
    });
  }
  return apiCache;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const cache = await getCache();
    const data = await cache.get(key);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Cache GET error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const cache = await getCache();
    await cache.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cache POST error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const cache = await getCache();
    await cache.delete(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cache DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 