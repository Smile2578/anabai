import { JobType } from 'bullmq';
import { blogQueue } from './queues/blog.queue';
import { imageQueue } from './queues/image.queue';
import { placeQueue } from './queues/place.queue';
import { importQueue } from './queues/import.queue';

export const queues = {
  blog: blogQueue,
  image: imageQueue,
  place: placeQueue,
  import: importQueue
} as const;

export type QueueName = keyof typeof queues;
export type QueueJobType = JobType; 