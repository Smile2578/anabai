// app/auth/signin/page.tsx

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader } from 'react-feather';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res && !res.error) {
      // Rediriger vers la page précédente ou la page d'accueil
      router.push(callbackUrl);
    } else {
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="mb-6 text-2xl font-bold">Connexion</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>
      <div className="mt-6">
        <p>
          Pas de compte ?{' '}
          <a href="/auth/signup" className="text-blue-500 hover:underline">
            Inscrivez-vous
          </a>
        </p>
        <p className="mt-2">
          Mot de passe oublié ?{' '}
          <a href="/auth/forgot-password" className="text-blue-500 hover:underline">
            Réinitialisez-le
          </a>
        </p>
      </div>
    </div>
  );
}
