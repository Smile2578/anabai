// lib/auth/tokens.ts

import crypto from 'crypto';

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

export const isTokenExpired = (expiryDate: Date): boolean => {
  return expiryDate.getTime() < Date.now();
};

export const generateVerificationToken = (): { token: string; hashedToken: string; expires: Date } => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

  return {
    token,
    hashedToken,
    expires
  };
};

export const generatePasswordResetToken = (): { token: string; hashedToken: string; expires: Date } => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  return {
    token,
    hashedToken,
    expires
  };
}; 