// app/auth/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader } from 'react-feather';
import Link from 'next/link';

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setSuccess('Un email a été envoyé pour réinitialiser votre mot de passe.');
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="mb-6 text-2xl font-bold">Mot de passe oublié</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4">
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            'Réinitialiser le mot de passe'
          )}
        </Button>
      </form>
      <div className="mt-6">
        <p>
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
