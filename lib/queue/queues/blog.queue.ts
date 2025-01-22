import { Job } from 'bullmq';
import { BlogJobData, BaseJobResult } from '../types/queue.types';
import { BaseQueueService } from '../services/BaseQueueService';
import { createClient } from '@/lib/supabase/server';

export class BlogQueueService extends BaseQueueService<BlogJobData, BaseJobResult> {
  constructor() {
    super('blog', async (job: Job<BlogJobData, BaseJobResult>) => {
      const { postId, action } = job.data;
      
      const supabase = await createClient();
      const { data: post, error: fetchError } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (fetchError || !post) {
        throw new Error(`Article ${postId} non trouvé`);
      }

      switch (action) {
        case 'publish': {
          const { error } = await supabase
            .from('blogs')
            .update({
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', postId);

          if (error) throw error;

          return {
            success: true,
            message: `Article ${postId} publié avec succès`,
            data: { postId, published: true }
          };
        }
        case 'unpublish': {
          const { error } = await supabase
            .from('blogs')
            .update({
              status: 'draft',
              published_at: null
            })
            .eq('id', postId);

          if (error) throw error;

          return {
            success: true,
            message: `Article ${postId} dépublié avec succès`,
            data: { postId, unpublished: true }
          };
        }
        case 'schedule': {
          const { error } = await supabase
            .from('blogs')
            .update({
              status: 'scheduled',
              scheduled_at: job.data.scheduledDate?.toISOString()
            })
            .eq('id', postId);

          if (error) throw error;

          return {
            success: true,
            message: `Publication de l'article ${postId} planifiée`,
            data: { postId, scheduled: true }
          };
        }
        case 'archive': {
          const { error } = await supabase
            .from('blogs')
            .update({
              status: 'archived'
            })
            .eq('id', postId);

          if (error) throw error;

          return {
            success: true,
            message: `Article ${postId} archivé avec succès`,
            data: { postId, archived: true }
          };
        }
        case 'delete': {
          const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', postId);

          if (error) throw error;

          return {
            success: true,
            message: `Article ${postId} supprimé avec succès`,
            data: { postId, deleted: true }
          };
        }
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    });
  }

  async addPublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('publish', {
      postId,
      userId,
      action: 'publish'
    });
  }

  async addUnpublishJob(postId: string, userId: string): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('unpublish', {
      postId,
      userId,
      action: 'unpublish'
    });
  }

  async addScheduleJob(
    postId: string, 
    userId: string, 
    scheduledDate: Date
  ): Promise<Job<BlogJobData, BaseJobResult>> {
    return this.addJob('schedule', {
      postId,
      userId,
      action: 'schedule',
      scheduledDate
    }, {
      delay: scheduledDate.getTime() - Date.now()
    });
  }

  async addArchiveJob(postId: string, userId: string) {
    return await this.addJob('archive', {
      postId,
      userId,
      action: 'archive'
    });
  }

  async addDeleteJob(postId: string, userId: string) {
    return await this.addJob('delete', {
      postId,
      userId,
      action: 'delete'
    });
  }
}

export const blogQueue = new BlogQueueService(); 