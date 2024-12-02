// components/auth/PasswordInput.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UseFormRegister, Path } from 'react-hook-form';

// Définition précise des props avec génériques pour une meilleure type safety
interface PasswordInputProps<TFormValues extends Record<string, unknown>> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  placeholder?: string;
  error?: boolean;
  name?: string;
  register?: UseFormRegister<TFormValues>;
  registerOptions?: Parameters<UseFormRegister<TFormValues>>[1];
}

export function PasswordInput<TFormValues extends Record<string, unknown>>({
  placeholder = 'Mot de passe',
  error,
  className,
  name,
  register,
  registerOptions,
  disabled,
  ...props
}: PasswordInputProps<TFormValues>) {
  // État pour gérer l'affichage/masquage du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // Préparation des props d'enregistrement si register est fourni
  const registerProps = register && name ? register(name as Path<TFormValues>, registerOptions) : {};

  return (
    <div className="relative">
      {/* Champ de mot de passe */}
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'pr-10', // Espace pour l'icône
          error && 'border-red-500',
          className
        )}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        {...registerProps}
        {...props}
      />

      {/* Bouton pour afficher/masquer le mot de passe */}
      <button
        type="button"
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "text-gray-500 hover:text-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        tabIndex={-1}
        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}