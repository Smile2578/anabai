// lib/services/blog/BlogQueueService.ts
import { createClient } from '@/lib/supabase/client';
import type { BlogScheduledTask } from '@/types/blog';
import { BaseQueueService } from '../core/BaseQueueService';
import { BlogJobData } from '@/lib/queue/types/blog.types';

export class BlogQueueService extends BaseQueueService {
  constructor() {
    super('blog');
  }

  async addScheduleJob(postId: string, userId: string, scheduledFor: string) {
    return this.add('schedule', {
      postId,
      userId,
      scheduledFor,
      action: 'schedule',
    } as BlogJobData);
  }

  static async schedulePublication(blogId: string, publishAt: Date): Promise<BlogScheduledTask | null> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('schedule_blog_publication', {
      blog_id: blogId,
      publish_at: publishAt.toISOString()
    });

    if (error) {
      console.error('Erreur lors de la programmation de la publication:', error);
      return null;
    }

    return data;
  }

  static async cancelScheduledPublication(taskId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('blog_scheduled_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Erreur lors de l\'annulation de la publication programmée:', error);
      return false;
    }

    return true;
  }

  static async getScheduledTasks(): Promise<BlogScheduledTask[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('blog_scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des tâches programmées:', error);
      return [];
    }

    return data;
  }
}

