// app/auth/link-account/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { toast } from 'sonner';

export default function LinkAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Récupération des paramètres de l'URL
  const email = searchParams.get('email');
  const provider = searchParams.get('provider');
  const token = searchParams.get('token');

  // Vérification des paramètres requis
  if (!email || !provider || !token) {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get('password');

      if (!password) {
        throw new Error('Le mot de passe est requis');
      }

      const payload = { 
        email, 
        provider,
        password: password.toString(),
        token
      };
      
      console.log('Payload envoyé:', payload);

      // Lier le compte directement sans pré-authentification
      const response = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Réponse reçue:', data);

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Afficher un message de succès
      toast.success('Comptes liés avec succès !');

      // Se connecter avec les credentials plutôt que le provider
      const signInResult = await signIn('credentials', {
        email,
        password: password.toString(),
        redirect: false
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Rediriger vers le dashboard
      router.push('/dashboard');

    } catch (err) {
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Une erreur est survenue lors de la liaison des comptes';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Lier votre compte {provider}</CardTitle>
        <CardDescription>
          Un compte existe déjà avec l&apos;email {email}. 
          Veuillez entrer votre mot de passe pour lier votre compte {provider}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (désactivé car déjà fourni) */}
          <Input 
            type="email" 
            value={email} 
            disabled 
            className="bg-muted"
          />

          {/* Champ de mot de passe */}
          <PasswordInput
            name="password"
            placeholder="Votre mot de passe"
            required
            disabled={isLoading}
            aria-invalid={error ? 'true' : 'false'}
          />

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Boutons d'action */}
          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Liaison en cours...' : 'Lier les comptes'}
            </Button>

            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => router.push('/auth/signin')}
              disabled={isLoading}
            >
              Retour à la connexion
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}