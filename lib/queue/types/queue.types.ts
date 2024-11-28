// lib/queue/types/queue.types.ts
export interface QueueConfig {
    redis: {
      host: string
      port: number
      password?: string
      maxRetriesPerRequest: null
      enableReadyCheck: false
    }
    defaultJobOptions: {
      attempts: number
      backoff: {
        type: 'exponential' | 'fixed'
        delay: number
      }
      removeOnComplete: boolean
      removeOnFail: boolean
    }
  }