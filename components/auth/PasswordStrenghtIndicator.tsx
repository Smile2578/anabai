// components/auth/PasswordStrengthIndicator.tsx
interface PasswordStrengthIndicatorProps {
    password: string;
  }
  
  export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const getStrength = () => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      return score;
    }
  
    const strength = getStrength();
  
    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-full flex-1 rounded-full transition-all duration-200 ${
                index <= strength
                  ? strength <= 2
                    ? "bg-red-500"
                    : strength <= 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs mt-1 text-muted-foreground">
          {strength <= 2 && "Mot de passe faible"}
          {strength === 3 && "Mot de passe moyen"}
          {strength >= 4 && "Mot de passe fort"}
        </p>
      </div>
    );
  }