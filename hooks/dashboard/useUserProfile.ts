import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import { useToast } from '@/hooks/use-toast';

let profileCache: RedisCacheService | null = null;

async function getCache(): Promise<RedisCacheService> {
  if (!profileCache) {
    profileCache = await createRedisCacheService({
      prefix: 'user:profile:',
      ttl: 3600
    });
  }
  return profileCache;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en' | 'ja';
    notifications: boolean;
  };
  metadata: {
    lastLogin: string;
    loginCount: number;
    createdAt: string;
  };
}

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const cache = await getCache();
  const cachedProfile = await cache.get<UserProfile>(userId);
  if (cachedProfile) {
    return cachedProfile;
  }

  const response = await fetch(`/api/users/${userId}/profile`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du profil');
  }

  const profile = await response.json();
  await cache.set(userId, profile);
  return profile;
}

async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du profil');
  }

  const updatedProfile = await response.json();
  const cache = await getCache();
  await cache.set(userId, updatedProfile);
  return updatedProfile;
}

export function useUserProfile(userId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['user', userId, 'profile'],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 5 * 60 * 1000, // Données fraîches pendant 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<UserProfile>) => updateUserProfile(userId, updates),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user', userId, 'profile'], updatedProfile);
      toast({
        description: 'Profil mis à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
      });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
