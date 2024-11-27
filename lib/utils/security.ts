import { headers } from 'next/headers';
import { AppError, errorCodes } from './error-handler';
import { auth } from '@/auth';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AppError(
      'Authentification requise',
      errorCodes.AUTH,
      401
    );
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    throw new AppError(
      'Accès non autorisé',
      errorCodes.FORBIDDEN,
      403
    );
  }
  return session;
}

export async function validateCSRFToken() {
  const headersList = headers();
  const csrfToken = (await headersList).get('x-csrf-token');
  
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    throw new AppError(
      'Token CSRF invalide',
      errorCodes.FORBIDDEN,
      403
    );
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprime les balises HTML
    .trim(); // Supprime les espaces inutiles
}

export function validateOrigin(origin: string | null) {
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000'
  ].filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) {
    throw new AppError(
      'Origine non autorisée',
      errorCodes.FORBIDDEN,
      403
    );
  }
}

interface RateLimitStore {
  get: (key: string) => number[];
  set: (key: string, value: number[]) => void;
}

declare global {
  var __rateLimit: RateLimitStore;
}

if (!globalThis.__rateLimit) {
  globalThis.__rateLimit = {
    get: (key: string) => [],
    set: (key: string, value: number[]) => {},
  };
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const requests = globalThis.__rateLimit.get(key) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  globalThis.__rateLimit.set(key, [...recentRequests, now]);
  return true;
} 