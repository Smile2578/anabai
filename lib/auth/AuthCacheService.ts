'use server';

import { upstashRedis } from '@/lib/queue/config/redis';
import type { User } from '@supabase/supabase-js';
import type { SetCommandOptions } from '@upstash/redis';

// Types
interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: Date;
}

interface LoginAttempts {
  count: number;
  lastAttempt: Date;
  blocked: boolean;
}

// Constantes
const AUTH_CACHE_TTL = {
  SESSION: 3600,    // 1 heure
  PROFILE: 300,     // 5 minutes
  VERIFICATION: 86400, // 24 heures
  LOGIN_ATTEMPTS: 1800 // 30 minutes
} as const;

// Préfixes des clés
const AUTH_CACHE_KEYS = {
  SESSION: 'auth:session:',
  PROFILE: 'auth:profile:',
  LOGIN_ATTEMPTS: 'auth:login_attempts:',
  VERIFICATION: 'auth:verification:',
} as const;

const MAX_LOGIN_ATTEMPTS = 5;
const redis = upstashRedis;

// Gestion des sessions
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const data = await redis.get<string>(`${AUTH_CACHE_KEYS.SESSION}${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function setSession(sessionId: string, data: SessionData): Promise<void> {
  const options: SetCommandOptions = { ex: AUTH_CACHE_TTL.SESSION };
  await redis.set(
    `${AUTH_CACHE_KEYS.SESSION}${sessionId}`,
    JSON.stringify(data),
    options
  );
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await redis.del(`${AUTH_CACHE_KEYS.SESSION}${sessionId}`);
}

// Gestion du profil utilisateur
export async function cacheUserProfile(userId: string, profile: Partial<User>): Promise<void> {
  const options: SetCommandOptions = { ex: AUTH_CACHE_TTL.PROFILE };
  await redis.set(
    `${AUTH_CACHE_KEYS.PROFILE}${userId}`,
    JSON.stringify(profile),
    options
  );
}

export async function getUserProfile(userId: string): Promise<Partial<User> | null> {
  const data = await redis.get<string>(`${AUTH_CACHE_KEYS.PROFILE}${userId}`);
  return data ? JSON.parse(data) : null;
}

// Gestion des tentatives de connexion
export async function trackLoginAttempt(email: string): Promise<boolean> {
  const key = `${AUTH_CACHE_KEYS.LOGIN_ATTEMPTS}${email}`;
  const currentData = await redis.get<string>(key);
  
  const attempts: LoginAttempts = currentData ? JSON.parse(currentData) : {
    count: 0,
    lastAttempt: new Date(),
    blocked: false
  };

  attempts.count += 1;
  attempts.lastAttempt = new Date();
  attempts.blocked = attempts.count >= MAX_LOGIN_ATTEMPTS;

  const options: SetCommandOptions = { ex: AUTH_CACHE_TTL.LOGIN_ATTEMPTS };
  await redis.set(
    key,
    JSON.stringify(attempts),
    options
  );

  return attempts.blocked;
}

export async function resetLoginAttempts(email: string): Promise<void> {
  await redis.del(`${AUTH_CACHE_KEYS.LOGIN_ATTEMPTS}${email}`);
}

// Gestion des tokens de vérification
export async function storeVerificationToken(token: string, userId: string): Promise<void> {
  const options: SetCommandOptions = { ex: AUTH_CACHE_TTL.VERIFICATION };
  await redis.set(
    `${AUTH_CACHE_KEYS.VERIFICATION}${token}`,
    userId,
    options
  );
}

export async function getVerificationToken(token: string): Promise<string | null> {
  return await redis.get<string>(`${AUTH_CACHE_KEYS.VERIFICATION}${token}`);
}

export async function invalidateVerificationToken(token: string): Promise<void> {
  await redis.del(`${AUTH_CACHE_KEYS.VERIFICATION}${token}`);
}

// Nettoyage
export async function clearUserData(userId: string): Promise<void> {
  const keys = await redis.keys(`auth:*:${userId}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Utilitaires
export async function isBlocked(email: string): Promise<boolean> {
  const data = await redis.get<string>(`${AUTH_CACHE_KEYS.LOGIN_ATTEMPTS}${email}`);
  if (!data) return false;
  
  const attempts: LoginAttempts = JSON.parse(data);
  return attempts.blocked;
}

export async function getLoginAttempts(email: string): Promise<LoginAttempts | null> {
  const data = await redis.get<string>(`${AUTH_CACHE_KEYS.LOGIN_ATTEMPTS}${email}`);
  return data ? JSON.parse(data) : null;
} 