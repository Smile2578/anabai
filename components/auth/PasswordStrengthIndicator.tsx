// components/auth/PasswordStrengthIndicator.tsx
import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  // Calcul dynamique de la force du mot de passe
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calcul du score basé sur les critères remplis
    score = Object.values(checks).filter(Boolean).length;

    // Configuration de l'apparence basée sur le score
    const strengthConfig = {
      0: { score: 0, label: 'Très faible', color: 'bg-gray-200' },
      1: { score: 20, label: 'Faible', color: 'bg-red-500' },
      2: { score: 40, label: 'Moyen', color: 'bg-orange-500' },
      3: { score: 60, label: 'Bon', color: 'bg-yellow-500' },
      4: { score: 80, label: 'Fort', color: 'bg-lime-500' },
      5: { score: 100, label: 'Très fort', color: 'bg-green-500' }
    };

    return strengthConfig[score as keyof typeof strengthConfig];
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1">
      {/* Barre de progression */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      
      {/* Texte indiquant la force */}
      <p className={`text-xs transition-colors ${
        strength.score <= 40 ? 'text-red-500' :
        strength.score <= 60 ? 'text-orange-500' :
        'text-green-500'
      }`}>
        Force du mot de passe : {strength.label}
      </p>

      {/* Critères de validation */}
      <ul className="text-xs space-y-1 text-muted-foreground mt-2">
        <li className={password.length >= 8 ? 'text-green-500' : ''}>
          ✓ Au moins 8 caractères
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
          ✓ Au moins une majuscule
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
          ✓ Au moins une minuscule
        </li>
        <li className={/\d/.test(password) ? 'text-green-500' : ''}>
          ✓ Au moins un chiffre
        </li>
        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : ''}>
          ✓ Au moins un caractère spécial
        </li>
      </ul>
    </div>
  );
}