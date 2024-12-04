// lib/queue/config/bullmq.server.ts
import { Queue, Worker, AdvancedOptions } from 'bullmq';
import { ioRedisClient } from './redis';
import { upstashRedis } from './redis';
import connectDB from '@/lib/db/connection';
import Questionnaire from '@/models/Questionnaire';
import { QuestionnaireData } from '@/types/questionnaire/questionnaire';

interface Queues {
  questionnaireQueue: Queue;
}

let queues: Queues | null = null;

// Interface pour le job de traitement du questionnaire
interface QuestionnaireJob {
  userId: string;
  data: QuestionnaireData;
}

// Nous créons un worker qui va traiter les questionnaires
const createQuestionnaireWorker = () => {
  return new Worker<QuestionnaireJob>(
    'questionnaire',
    async (job) => {
      const { userId, data } = job.data;

      try {
        // Se connecter à la base de données
        await connectDB();

        // Rechercher un questionnaire existant pour cet utilisateur
        const existingQuestionnaire = await Questionnaire.findOne({ userId });

        // Mise à jour ou création du questionnaire
        if (existingQuestionnaire) {
          await Questionnaire.findByIdAndUpdate(
            existingQuestionnaire._id,
            {
              ...data,
              updatedAt: new Date(),
              status: 'completed'
            },
            { new: true }
          );
        } else {
          await Questionnaire.create({
            userId,
            ...data,
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        // Mettre à jour le cache Redis
        await upstashRedis.set(
          `questionnaire:${userId}`,
          JSON.stringify(data),
          { ex: 3600 } // Cache pendant 1 heure
        );

        // Enregistrer le succès du traitement
        await job.updateProgress(100);
        return { success: true, userId, processedAt: new Date() };

      } catch (error) {
        console.error(`Error processing questionnaire for user ${userId}:`, error);
        throw error;
      }
    },
    {
      connection: ioRedisClient,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 1000
      },
      settings: {
        lockDuration: 30000,
        stalledInterval: 30000,
        maxStalledCount: 2
      } as AdvancedOptions
    }
  );
};

export function initializeQueues(): Queues {
  if (!queues) {
    queues = {
      questionnaireQueue: new Queue('questionnaire-queue', {
        connection: ioRedisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      })
    };
  }
  return queues;
}

// Initialisation et gestion des événements du worker
const worker = createQuestionnaireWorker();

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

// Fonction pour ajouter un questionnaire à la queue
export async function addQuestionnaireToQueue(userId: string, data: QuestionnaireData) {
  const { questionnaireQueue } = initializeQueues();
  try {
    const job = await questionnaireQueue.add(
      'process-questionnaire',
      { userId, data },
      {
        jobId: `questionnaire-${userId}-${Date.now()}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    );

    return { jobId: job.id, status: 'queued' };
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
}

// Fonction pour vérifier le statut d'un job
export async function getQuestionnaireJobStatus(jobId: string) {
  const { questionnaireQueue } = initializeQueues();
  try {
    const job = await questionnaireQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      jobId: job.id,
      status: state,
      progress,
      data: job.data,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    throw error;
  }
}

// Fonction pour nettoyer les anciens jobs
export async function cleanupOldJobs() {
  const { questionnaireQueue } = initializeQueues();
  try {
    await questionnaireQueue.clean(24 * 3600 * 1000, 1000); // Nettoyer les jobs plus vieux que 24h
    await questionnaireQueue.clean(24 * 3600 * 1000, 1000, 'failed'); // Nettoyer les jobs échoués
  } catch (error) {
    console.error('Error cleaning up jobs:', error);
    throw error;
  }
}

export {
  worker
};
