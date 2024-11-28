// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { Loader } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import AnabaLogo from '@/components/brand/AnabaLogo';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { signIn } from 'next-auth/react';
import { cn } from "@/lib/utils";

// Schéma de validation Zod pour le formulaire
const signupSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(
      /(?=.*[@$!%*?&])/,
      'Le mot de passe doit contenir au moins un caractère spécial'
    ),
  confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-center' as const
};

type SignupFormData = z.infer<typeof signupSchema>;

// Fonction pour calculer la force du mot de passe
function calculatePasswordStrength(password: string) {
  if (!password) return { score: 0, feedback: '', color: 'bg-gray-200' };

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&]/.test(password)
  ];

  const score = checks.filter(Boolean).length;
  
  const strengthMap = {
    0: { score: 0, feedback: 'Très faible', color: 'bg-gray-200' },
    1: { score: 20, feedback: 'Faible', color: 'bg-red-500' },
    2: { score: 40, feedback: 'Moyen', color: 'bg-orange-500' },
    3: { score: 60, feedback: 'Bon', color: 'bg-yellow-500' },
    4: { score: 80, feedback: 'Fort', color: 'bg-lime-500' },
    5: { score: 100, feedback: 'Très fort', color: 'bg-green-500' }
  };

  return strengthMap[score as keyof typeof strengthMap];
}

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password', '');
  const passwordStrength = calculatePasswordStrength(passwordValue);

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success(
          'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
          TOAST_CONFIG
        );
        
        // Attendre un peu avant la redirection pour que l'utilisateur puisse voir le message
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/auth/signin');
      } else {
        toast.error(responseData.error || 'Une erreur est survenue.', TOAST_CONFIG);
        setError(responseData.error || 'Une erreur est survenue lors de l\'inscription.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(errorMessage, TOAST_CONFIG);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de connexion Google
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
      toast.error('Erreur lors de la connexion avec Google', TOAST_CONFIG);
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className="auth-container flex items-center justify-center">
        <div className="auth-card w-full max-w-md">
          <div className="auth-form-container">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <AnabaLogo />
              </div>
              <h1 className="auth-title">Inscription</h1>
              <p className="auth-subtitle">Commencez votre voyage au Japon</p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Champ Nom */}
              <div>
                <Input
                  type="text"
                  placeholder="Nom"
                  {...register('name')}
                  className="auth-input"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Champ Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register('email')}
                  className="auth-input"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Champ Mot de passe avec indicateur de force */}
              <div className="space-y-2">
                <PasswordInput
                  placeholder="Mot de passe"
                  register={register}
                  name="password"
                  error={!!errors.password}
                  disabled={loading}
                />
                
                {/* Indicateur de force du mot de passe */}
                {passwordValue && (
                  <div className="space-y-1">
                    <Progress 
                      value={passwordStrength.score} 
                      className={cn("h-1", passwordStrength.color)}
                    />
                    <p className={cn(
                      "text-xs",
                      passwordStrength.score <= 40 ? "text-red-500" :
                      passwordStrength.score <= 60 ? "text-orange-500" :
                      "text-green-500"
                    )}>
                      Force du mot de passe : {passwordStrength.feedback}
                    </p>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <PasswordInput
                  placeholder="Confirmez le mot de passe"
                  register={register}
                  name="confirmPassword"
                  error={!!errors.confirmPassword}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Bouton d'inscription */}
              <Button
                type="submit"
                className="w-full auth-button"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
            
            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            
            {/* Connexion Google */}
            <button
              className="auth-social-button w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Image
                src="/google-icon.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continuer avec Google
            </button>
            
            {/* Lien de connexion */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Vous avez déjà un compte ?<br />
                <Link
                  href="/auth/signin"
                  className="text-primary hover:text-primary/90 text-xl font-semibold"
                >
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}