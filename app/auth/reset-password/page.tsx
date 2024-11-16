// app/auth/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader } from 'react-feather';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const resetPasswordSchema = z
  .object({
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
    confirmPassword: z.string().nonempty('Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          password: data.password,
          token,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        alert('Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
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

  useEffect(() => {
    if (!token) {
      setError('Token invalide ou manquant.');
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="mb-6 text-2xl font-bold">Réinitialiser le mot de passe</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Confirmez le mot de passe"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading || !!error}>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            'Réinitialiser le mot de passe'
          )}
        </Button>
      </form>
    </div>
  );
}
