// app/auth/setup-google-account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { toast } from 'sonner';

interface SetupState {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
}

export default function SetupGoogleAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get('token');

  const [state, setState] = useState<SetupState>({
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: null
  });

  // Vérification du token au chargement
  useEffect(() => {
    if (!setupToken) {
      toast.error("Token de configuration manquant");
      router.push('/auth/signin');
    }
  }, [setupToken, router]);

  const updateState = (updates: Partial<SetupState>) => {
    setState(current => ({ ...current, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateState({ error: null, isLoading: true });

    try {
      if (state.password !== state.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      // Configuration du compte
      const response = await fetch('/api/auth/setup-google-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: state.password,
          setupToken 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      toast.success('Configuration du compte réussie !');

      // Connexion automatique
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: state.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Redirection vers le dashboard
      router.push('/dashboard');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      updateState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  };

  if (!setupToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuration de votre compte</CardTitle>
          <CardDescription>
            Pour finaliser la création de votre compte Google, veuillez définir un mot de passe.
            Cela vous permettra de vous connecter même sans Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <PasswordInput
                value={state.password}
                onChange={(e) => updateState({ password: e.target.value })}
                placeholder="Choisissez un mot de passe"
                required
                disabled={state.isLoading}
              />
              <PasswordStrengthIndicator password={state.password} />
            </div>
            
            <div className="space-y-2">
              <PasswordInput
                value={state.confirmPassword}
                onChange={(e) => updateState({ confirmPassword: e.target.value })}
                placeholder="Confirmez le mot de passe"
                required
                disabled={state.isLoading}
              />
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Configuration en cours...' : 'Configurer le compte'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/auth/signin')}
                disabled={state.isLoading}
              >
                Retour à la connexion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}