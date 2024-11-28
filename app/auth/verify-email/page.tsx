// app/auth/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import AnabaLogo from '@/components/brand/AnabaLogo';

// Nous définissons les différents états possibles de la vérification
type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid-token';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Vérification de votre email...');

  // Effectuer la vérification dès que la page est chargée
  useEffect(() => {
    if (!token) {
      setStatus('invalid-token');
      setMessage('Token de vérification manquant.');
      return;
    }
  
    const verifyEmail = async (verificationToken: string) => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verificationToken }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setStatus('success');
          setMessage('Votre email a été vérifié avec succès !');
          // Redirection automatique après 3 secondes
          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Une erreur est survenue lors de la vérification.');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du token:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification.');
      }
    };
  
    verifyEmail(token);
  }, [token, router]);

  // Rendu conditionnel basé sur le statut
  const renderContent = () => {
    const statusConfig = {
      loading: {
        icon: <Loader className="h-12 w-12 animate-spin text-primary" />,
        title: 'Vérification en cours',
        buttonText: null,
      },
      success: {
        icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
        title: 'Email vérifié !',
        buttonText: 'Se connecter',
      },
      error: {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: 'Erreur de vérification',
        buttonText: 'Réessayer',
      },
      'invalid-token': {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: 'Token invalide',
        buttonText: 'Retour à l\'accueil',
      },
    };

    const config = statusConfig[status];

    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">{config.icon}</div>
        <h1 className="text-2xl font-semibold text-foreground">{config.title}</h1>
        <p className="text-muted-foreground">{message}</p>
        {config.buttonText && (
          <Button 
            className="mt-4"
            onClick={() => router.push(status === 'success' ? '/auth/signin' : '/')}
          >
            {config.buttonText}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-8">
          <AnabaLogo />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-lg">
          {renderContent()}
        </div>

        {/* Aide supplémentaire pour les erreurs */}
        {(status === 'error' || status === 'invalid-token') && (
          <Alert className="mt-4">
            <AlertDescription>
              Si vous continuez à rencontrer des problèmes, veuillez{' '}
              <Link 
                href="/support" 
                className="text-primary hover:text-primary/90 underline"
              >
                contacter le support
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}