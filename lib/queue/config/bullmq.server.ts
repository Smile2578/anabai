// lib/queue/config/bullmq.server.ts
'use server';

import { Queue, ConnectionOptions } from 'bullmq';
import { createClient } from '@/lib/supabase/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Client Supabase pour les composants côté client
export const supabaseClient = createClientComponentClient<Database>();

// Client Supabase pour les opérations côté serveur
export const supabaseServer = createClient();

export const QUEUE_CONNECTION: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
} as const;

export const QUEUE_NAMES = {
  BLOG: 'blog',
  PLACE: 'place',
  IMAGE: 'image',
  IMPORT: 'import',
} as const;

interface Queues {
  [key: string]: Queue;
}

let queues: Queues | null = null;

export async function initializeQueues(): Promise<Queues> {
  if (!queues) {
    queues = Object.values(QUEUE_NAMES).reduce((acc, queueName) => ({
      ...acc,
      [queueName]: new Queue(queueName, {
        connection: QUEUE_CONNECTION,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      }),
    }), {});
  }
  return queues;
}

export async function getQueue(name: keyof typeof QUEUE_NAMES): Promise<Queue> {
  const allQueues = await initializeQueues();
  return allQueues[name];
}

export async function cleanupOldJobs(queueName: keyof typeof QUEUE_NAMES) {
  const queue = await getQueue(queueName);
  try {
    await queue.clean(24 * 3600 * 1000, 1000); // Nettoyer les jobs plus vieux que 24h
    await queue.clean(24 * 3600 * 1000, 1000, 'failed'); // Nettoyer les jobs échoués
  } catch (error) {
    console.error(`Error cleaning up jobs for queue ${queueName}:`, error);
    throw error;
  }
}
