'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import AnabaLogo from '@/components/brand/AnabaLogo';

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

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        router.push('/auth/signin');
      } else {
        const responseData = await res.json();
        setError(responseData.error || 'Une erreur est survenue.');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center">
      <div className="auth-card w-full max-w-md">
        <div className="auth-form-container">
          <div className="text-center mb-8">
            <AnabaLogo />
            <h1 className="auth-title">Créer un compte AnabAI</h1>
            <p className="auth-subtitle">Commencez votre voyage au Japon</p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                {...register('password')}
                className="auth-input"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirmez le mot de passe"
                {...register('confirmPassword')}
                className="auth-input"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>
          
          <div className="auth-divider">
            <span>ou</span>
          </div>
          
          <div className="space-y-3">
            <button className="auth-social-button">
              <Image src="/google-icon.png" alt="Google" width={20} height={20} />
              Continuer avec Google
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-white/60">
              Vous avez déjà un compte ?{' '}
              <Link href="/auth/signin" className="auth-link">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}