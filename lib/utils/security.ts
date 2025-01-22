import { headers } from 'next/headers';
import { AppError, errorCodes } from './error-handler';
import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.user) {
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
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !user?.role || !allowedRoles.includes(user.role)) {
    throw new AppError(
      'Accès non autorisé',
      errorCodes.FORBIDDEN,
      403
    );
  }

  return { ...session, user: { ...session.user, role: user.role } };
}

export async function validateCSRFToken() {
  const headersList = await headers();
  const csrfToken = headersList.get('x-csrf-token');
  
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
    process.env.NEXT_PUBLIC_SITE_URL,
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

const rateLimitMap = new Map<string, number[]>();

const rateLimitStore: RateLimitStore = {
  get: (key: string) => rateLimitMap.get(key) || [],
  set: (key: string, value: number[]) => rateLimitMap.set(key, value),
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const requests = rateLimitStore.get(key);
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  rateLimitStore.set(key, [...recentRequests, now]);
  return true;
} 