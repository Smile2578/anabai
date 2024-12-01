import { useState, useEffect } from 'react';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import { Place } from '@/types/places/main';

let placeCache: RedisCacheService | null = null;

async function getPlaceCache(): Promise<RedisCacheService> {
  if (!placeCache) {
    placeCache = await createRedisCacheService({
      prefix: 'places:',
      ttl: 3600 // 1 heure
    });
  }
  return placeCache;
}

export function usePlaceCache(placeId: string) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const cache = await getPlaceCache();
        const cachedPlace = await cache.get<Place>(placeId);
        if (cachedPlace) {
          setPlace(cachedPlace);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId]);

  const updatePlace = async (newPlace: Place) => {
    try {
      const cache = await getPlaceCache();
      await cache.set(placeId, newPlace);
      setPlace(newPlace);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de la mise à jour'));
      throw err;
    }
  };

  return { place, loading, error, updatePlace };
} 