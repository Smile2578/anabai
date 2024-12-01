import { useState, useCallback } from 'react';
import { BlogQueueService } from '@/lib/services/blog/BlogQueueService';

interface QueueState {
  loading: boolean;
  error: string | null;
  jobId: string | null;
}

const queueService = new BlogQueueService();

export function useBlogQueue() {
  const [state, setState] = useState<QueueState>({
    loading: false,
    error: null,
    jobId: null,
  });

  const publishPost = useCallback(async (postId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await queueService.addPublishJob(postId, userId);
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

  const unpublishPost = useCallback(async (postId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await queueService.addUnpublishJob(postId, userId);
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

  const schedulePost = useCallback(async (postId: string, userId: string, scheduledDate: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await queueService.addScheduleJob(postId, userId, scheduledDate);
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

  const processImages = useCallback(async (postId: string, userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const job = await queueService.addImageProcessingJob(postId, userId);
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
      const job = await queueService.getJob(jobId);
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
    publishPost,
    unpublishPost,
    schedulePost,
    processImages,
    getJobStatus,
  };
} 