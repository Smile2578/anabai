import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import { useToast } from '@/hooks/use-toast';

let prefsCache: RedisCacheService | null = null;

async function getCache(): Promise<RedisCacheService> {
  if (!prefsCache) {
    prefsCache = await createRedisCacheService({
      prefix: 'user:preferences:',
      ttl: 86400
    });
  }
  return prefsCache;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'ja';
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: 'analytics' | 'places' | 'blog';
    widgets: string[];
  };
}

async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const cache = await getCache();
  const cachedPrefs = await cache.get<UserPreferences>(userId);
  if (cachedPrefs) {
    return cachedPrefs;
  }

  const response = await fetch(`/api/users/${userId}/preferences`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des préférences');
  }

  const prefs = await response.json();
  await cache.set(userId, prefs);
  return prefs;
}

async function updatePreferences(
  userId: string,
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const response = await fetch(`/api/users/${userId}/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour des préférences');
  }

  const updatedPrefs = await response.json();
  const cache = await getCache();
  await cache.set(userId, updatedPrefs);
  return updatedPrefs;
}

export function usePreferences(userId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: ['user', userId, 'preferences'],
    queryFn: () => fetchPreferences(userId),
    staleTime: 5 * 60 * 1000, // Données fraîches pendant 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<UserPreferences>) => updatePreferences(userId, updates),
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(['user', userId, 'preferences'], updatedPrefs);
      toast({
        description: 'Préférences mises à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Erreur lors de la mise à jour des préférences',
      });
    },
  });

  return {
    preferences: prefsQuery.data,
    isLoading: prefsQuery.isLoading,
    error: prefsQuery.error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
