import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  RATE_LIMIT_WINDOW: z.number().int().positive(),
  RATE_LIMIT_MAX_REQUESTS: z.number().int().positive(),
  CACHE_TTL: z.number().int().positive(),
});

function validateEnv() {
  const parsedEnv = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    JWT_SECRET: process.env.JWT_SECRET,
    RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW || 60),
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    CACHE_TTL: Number(process.env.CACHE_TTL || 3600),
  });

  if (!parsedEnv.success) {
    console.error('❌ Variables d\'environnement invalides:', parsedEnv.error.format());
    throw new Error('Configuration d\'environnement invalide');
  }

  return parsedEnv.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>; 