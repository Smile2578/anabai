import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../config/redis';
import { BlogJobData, BlogJobResult } from '../types/blog.types';

const connection = {
  host: redisConfig.host || 'localhost',
  port: redisConfig.port || 6379,
  password: redisConfig.password,
};

export const blogQueue = new Queue<BlogJobData>('blog', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Créer un worker pour traiter les jobs
export const worker = new Worker<BlogJobData, BlogJobResult>(
  'blog',
  async (job) => {
    const { postId, action, scheduledDate} = job.data;

    try {
      switch (action) {
        case 'publish':
          // TODO: Implémenter la logique de publication
          return {
            success: true,
            message: `Article ${postId} publié avec succès`,
          };

        case 'unpublish':
          // TODO: Implémenter la logique de dépublication
          return {
            success: true,
            message: `Article ${postId} dépublié avec succès`,
          };

        case 'schedule':
          if (!scheduledDate) {
            throw new Error('Date de publication programmée requise');
          }
          // TODO: Implémenter la logique de programmation
          return {
            success: true,
            message: `Article ${postId} programmé pour le ${scheduledDate}`,
          };

        case 'process-images':
          // TODO: Implémenter le traitement des images
          return {
            success: true,
            message: `Images de l'article ${postId} traitées avec succès`,
          };

        default:
          throw new Error(`Action inconnue: ${action}`);
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de l'article ${postId}:`, error);
      throw error;
    }
  },
  { 
    connection,
    autorun: true,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
);

// Gestionnaires d'événements
worker.on('completed', (job) => {
  console.log(`Job ${job.id} terminé avec succès`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} échoué:`, error);
});

worker.on('error', (error) => {
  console.error('Erreur de worker:', error);
}); 