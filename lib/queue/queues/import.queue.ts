// lib/queue/queues/import.queue.ts
import Queue from 'bull'
import { redisConfig } from '../config/redis'
import { ImportJobData} from '../types/import.types'
import { QueueConfig } from '../types/queue.types'

const queueConfig: QueueConfig = {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
}

export const importQueue = new Queue<ImportJobData>('import', queueConfig)