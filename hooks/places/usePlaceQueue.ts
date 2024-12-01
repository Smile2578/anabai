import { useState, useCallback } from 'react';
import { placeQueue } from '@/lib/queue/queues/place.queue';

interface QueueState {
  loading: boolean;
  error: string | null;
  jobId: string | null;
}

export function usePlaceQueue() {
  const [state, setState] = useState<QueueState>({
    loading: false,
    error: null,
    jobId: null,
  });

  const enrichPlace = useCallback(async (placeId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await placeQueue.addEnrichJob(placeId, userId);
      setState(prev => ({ ...prev, loading: false, jobId: job.id || null }));
      return job;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      throw error;
    }
  }, []);

  const validatePlace = useCallback(async (placeId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await placeQueue.addValidateJob(placeId, userId);
      setState(prev => ({ ...prev, loading: false, jobId: job.id || null }));
      return job;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      throw error;
    }
  }, []);

  const updatePlace = useCallback(async (placeId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await placeQueue.addUpdateJob(placeId, userId);
      setState(prev => ({ ...prev, loading: false, jobId: job.id || null }));
      return job;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      throw error;
    }
  }, []);

  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      const job = await placeQueue.getJob(jobId);
      if (!job) {
        throw new Error('Tâche non trouvée');
      }
      return {
        id: job.id,
        state: await job.getState(),
        data: job.data,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    enrichPlace,
    validatePlace,
    updatePlace,
    getJobStatus,
  };
} 