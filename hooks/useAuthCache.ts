import { useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import * as AuthCache from '@/lib/auth/AuthCacheService';

export const useAuthCache = () => {
  const cacheSession = useCallback(async (session: Session) => {
    if (!session.user?.id) return;
    await AuthCache.setSession(session.user.id, {
      userId: session.user.id,
      email: session.user.email || '',
      role: session.user.role || 'user',
      lastActivity: new Date(),
    });
  }, []);

  const getCachedSession = useCallback(async (userId: string) => {
    return await AuthCache.getSession(userId);
  }, []);

  const trackLoginAttempt = useCallback(async (email: string) => {
    return await AuthCache.trackLoginAttempt(email);
  }, []);

  const clearLoginAttempts = useCallback(async (email: string) => {
    await AuthCache.resetLoginAttempts(email);
  }, []);

  const isUserBlocked = useCallback(async (email: string) => {
    return await AuthCache.isBlocked(email);
  }, []);

  const cacheVerificationToken = useCallback(async (email: string, token: string) => {
    await AuthCache.storeVerificationToken(token, email);
  }, []);

  const getVerificationToken = useCallback(async (token: string) => {
    return await AuthCache.getVerificationToken(token);
  }, []);

  const invalidateSession = useCallback(async (userId: string) => {
    await AuthCache.invalidateSession(userId);
  }, []);

  return {
    cacheSession,
    getCachedSession,
    trackLoginAttempt,
    clearLoginAttempts,
    isUserBlocked,
    cacheVerificationToken,
    getVerificationToken,
    invalidateSession,
  };
}; 