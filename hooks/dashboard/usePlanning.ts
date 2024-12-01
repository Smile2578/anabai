import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedisCacheService, createRedisCacheService } from '@/lib/services/core/RedisCacheService';
import { useToast } from '@/hooks/use-toast';
import { BlogQueueService } from '@/lib/services/blog/BlogQueueService';

let planningCache: RedisCacheService | null = null;

async function getCache(): Promise<RedisCacheService> {
  if (!planningCache) {
    planningCache = await createRedisCacheService({
      prefix: 'planning:',
      ttl: 3600
    });
  }
  return planningCache;
}

const blogQueue = new BlogQueueService();

interface ScheduledTask {
  id: string;
  type: 'blog' | 'place' | 'import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledFor: string;
  data: {
    postId?: string;
    placeId?: string;
    action: string;
    userId: string;
  };
  metadata?: {
    attempts: number;
    lastAttempt?: string;
    error?: string;
  };
}

async function fetchScheduledTasks(userId: string): Promise<ScheduledTask[]> {
  const cache = await getCache();
  const cachedTasks = await cache.get<ScheduledTask[]>(`user:${userId}`);
  if (cachedTasks) {
    return cachedTasks;
  }

  const response = await fetch(`/api/planning/${userId}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des tâches planifiées');
  }

  const tasks = await response.json();
  await cache.set(`user:${userId}`, tasks);
  return tasks;
}

async function scheduleTask(task: Omit<ScheduledTask, 'id' | 'status'>): Promise<ScheduledTask> {
  let job;

  // Ajouter la tâche à la file d'attente appropriée
  switch (task.type) {
    case 'blog':
      if (task.data.postId) {
        job = await blogQueue.addScheduleJob(
          task.data.postId,
          task.data.userId,
          task.scheduledFor
        );
      }
      break;
    // Ajouter d'autres types de tâches ici
  }

  if (!job) {
    throw new Error('Type de tâche non supporté');
  }

  // Créer la tâche dans l'API
  const response = await fetch('/api/planning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...task, jobId: job.id }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la tâche planifiée');
  }

  return response.json();
}

export function usePlanning(userId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['planning', userId],
    queryFn: () => fetchScheduledTasks(userId),
    staleTime: 60 * 1000, // Données fraîches pendant 1 minute
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<ScheduledTask[]>(['planning', userId], (old = []) => {
        return [...old, newTask];
      });
      toast({
        description: 'Tâche planifiée avec succès',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Erreur lors de la planification',
      });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    scheduleTask: scheduleMutation.mutate,
    isScheduling: scheduleMutation.isPending,
  };
}
