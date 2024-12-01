import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { env } from '@/lib/env.config';
import { createError, AppError } from '@/lib/errors/AppError';

const redis = new Redis(env.REDIS_URL);

interface RateLimitConfig {
  window: number;  // en secondes
  max: number;     // nombre maximum de requêtes
}

export async function rateLimiter(
  req: NextRequest,
  config: RateLimitConfig = {
    window: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX_REQUESTS
  }
) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  const key = `rate-limit:${ip}:${req.nextUrl.pathname}`;

  const multi = redis.multi();
  multi.incr(key);
  multi.expire(key, config.window);
  
  try {
    const results = await multi.exec();
    if (!results) {
      throw createError.internal('Erreur Redis lors du rate limiting');
    }

    const [incrResult] = results;
    const count = incrResult[1] as number;
    
    // Ajouter les headers de rate limit
    const remaining = Math.max(0, config.max - count);
    const responseHeaders = new Headers({
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + config.window).toString()
    });

    // Vérifier si la limite est dépassée
    if (count > config.max) {
      throw createError.rateLimit(
        'Trop de requêtes, veuillez réessayer plus tard',
        { 
          window: config.window,
          max: config.max,
          current: count
        }
      );
    }

    return responseHeaders;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw createError.internal('Erreur lors de la vérification du rate limit');
  }
}

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

export function withRateLimit(handler: RouteHandler, config?: RateLimitConfig) {
  return async function rateLimitWrapper(
    req: NextRequest,
    ...args: unknown[]
  ): Promise<NextResponse> {
    try {
      const responseHeaders = await rateLimiter(req, config);
      const response = await handler(req, ...args);
      
      // Copier les headers de rate limit sur la réponse
      if (response instanceof NextResponse) {
        responseHeaders.forEach((value, key) => {
          response.headers.set(key, value);
        });
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: error instanceof AppError ? error.statusCode : 429 }
        );
      }
      return NextResponse.json(
        { error: 'Rate limit error' },
        { status: 429 }
      );
    }
  };
} 