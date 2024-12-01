import { useQuery } from '@tanstack/react-query';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';

let analyticsCache: RedisCacheService | null = null;

async function getCache(): Promise<RedisCacheService> {
  if (!analyticsCache) {
    analyticsCache = await createRedisCacheService({
      prefix: 'analytics:',
      ttl: 300
    });
  }
  return analyticsCache;
}

interface Analytics {
  views: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  places: {
    total: number;
    published: number;
    draft: number;
  };
  users: {
    total: number;
    active: number;
  };
}

async function fetchAnalytics(): Promise<Analytics> {
  const cache = await getCache();
  const cachedAnalytics = await cache.get<Analytics>('dashboard');
  if (cachedAnalytics) {
    return cachedAnalytics;
  }

  const response = await fetch('/api/admin/analytics');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des analytics');
  }

  const analytics = await response.json();
  await cache.set('dashboard', analytics);
  return analytics;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 60 * 1000, // Données fraîches pendant 1 minute
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
}
