// hooks/usePasswordStrength.ts
import { useState, useCallback } from 'react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  isValid: boolean;
}

// Hook pour gérer la validation et la force du mot de passe
export function usePasswordStrength() {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'bg-gray-200',
    isValid: false
  });

  const analyzePassword = useCallback((password: string): PasswordStrength => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const feedback = [];
    if (!checks.length) feedback.push('Au moins 8 caractères');
    if (!checks.uppercase) feedback.push('Au moins une majuscule');
    if (!checks.lowercase) feedback.push('Au moins une minuscule');
    if (!checks.number) feedback.push('Au moins un chiffre');
    if (!checks.special) feedback.push('Au moins un caractère spécial');

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 5) * 100;
    const isValid = passedChecks === 5;

    const strengthColors = {
      0: 'bg-gray-200',
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-lime-500',
      5: 'bg-green-500'
    };

    return {
      score,
      feedback,
      color: strengthColors[passedChecks as keyof typeof strengthColors],
      isValid
    };
  }, []);

  const checkPassword = useCallback((password: string) => {
    const result = analyzePassword(password);
    setStrength(result);
    return result;
  }, [analyzePassword]);

  return { strength, checkPassword };
}