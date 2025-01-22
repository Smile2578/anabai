// hooks/blog/useQueue.ts
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BlogScheduledTask } from '@/types/blog';

interface QueueState {
  loading: boolean;
  error: string | null;
  taskId: string | null;
}

export function useBlogQueue() {
  const [state, setState] = useState<QueueState>({
    loading: false,
    error: null,
    taskId: null,
  });

  const schedulePost = useCallback(async (postId: string, scheduledDate: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const supabase = createClient();
    try {
      const { data, error } = await supabase.rpc('schedule_blog_publication', {
        blog_id: postId,
        publish_at: scheduledDate
      });

      if (error) throw error;
      setState(prev => ({ ...prev, loading: false, taskId: data.id }));
      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }));
      throw error;
    }
  }, []);

  const getTaskStatus = useCallback(async (taskId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('blog_scheduled_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data as BlogScheduledTask;
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
    schedulePost,
    getTaskStatus,
  };
}