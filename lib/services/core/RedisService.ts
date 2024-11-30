// lib/services/core/RedisService.ts
import { Redis } from '@upstash/redis';
import { createClient } from 'redis';
import { ConnectionOptions } from 'bullmq';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Les variables d\'environnement Redis REST ne sont pas configurées');
}

if (!process.env.REDIS_URL) {
  throw new Error('La variable d\'environnement REDIS_URL n\'est pas configurée');
}

// Client Redis REST API (pour les opérations simples)
export const redisRest = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Client Redis natif (pour les opérations complexes)
export const createRedisClient = () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL est requis pour créer un client Redis');
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error('Échec de la reconnexion après 10 tentatives');
          return new Error('Échec de la reconnexion');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  client.on('error', (err) => console.error('Erreur Redis:', err));
  client.on('connect', () => console.log('Redis connecté'));
  client.on('reconnecting', () => console.log('Redis reconnexion...'));
  client.on('end', () => console.log('Redis déconnecté'));

  return client;
};

// Configuration Redis pour BullMQ
const getRedisUrlParts = () => {
  const url = new URL(process.env.REDIS_URL || '');
  return {
    host: url.hostname,
    port: parseInt(url.port),
    username: url.username || 'default',
    password: url.password
  };
};

const { host, port, username, password } = getRedisUrlParts();

export const redisConnection: ConnectionOptions = {
  host,
  port,
  username,
  password,
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    if (times > 5) return null;
    return Math.min(times * 1000, 5000);
  },
};