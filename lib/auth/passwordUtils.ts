// lib/auth/passwordUtils.ts

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Longueur minimale
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  } else {
    score += 2;
  }

  // Présence de chiffres
  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  } else {
    score += 2;
  }

  // Présence de lettres minuscules
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  } else {
    score += 2;
  }

  // Présence de lettres majuscules
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  } else {
    score += 2;
  }

  // Présence de caractères spéciaux
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial");
  } else {
    score += 2;
  }

  // Bonus pour la longueur
  if (password.length >= 12) score += 2;
  if (password.length >= 16) score += 2;

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 10) // Score sur 10
  };
};

// Rate limiting pour les tentatives de réinitialisation
interface ResetAttempt {
  count: number;
  firstAttempt: number;
  isBlocked: boolean;
  blockExpiry?: number;
}

const resetAttempts = new Map<string, ResetAttempt>();

export const checkResetAttempts = (identifier: string): boolean => {
  const now = Date.now();
  const attempt = resetAttempts.get(identifier) || {
    count: 0,
    firstAttempt: now,
    isBlocked: false
  };

  // Si bloqué, vérifier si le blocage est expiré
  if (attempt.isBlocked && attempt.blockExpiry) {
    if (now > attempt.blockExpiry) {
      resetAttempts.delete(identifier);
      return true;
    }
    return false;
  }

  // Réinitialiser le compteur après 24h
  if (now - attempt.firstAttempt > 24 * 60 * 60 * 1000) {
    resetAttempts.set(identifier, {
      count: 1,
      firstAttempt: now,
      isBlocked: false
    });
    return true;
  }

  // Incrémenter le compteur
  attempt.count++;

  // Bloquer après 5 tentatives
  if (attempt.count >= 5) {
    attempt.isBlocked = true;
    attempt.blockExpiry = now + 30 * 60 * 1000; // Blocage de 30 minutes
    resetAttempts.set(identifier, attempt);
    return false;
  }

  resetAttempts.set(identifier, attempt);
  return true;
};

export const getResetAttemptInfo = (identifier: string): ResetAttempt | undefined => {
  return resetAttempts.get(identifier);
}; 