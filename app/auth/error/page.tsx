// app/auth/error/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

// Définition des messages d'erreur détaillés avec des suggestions d'actions
const errorMessages = {
  AccessDenied: {
    title: "Accès refusé",
    message: "Ce compte existe déjà avec une autre méthode de connexion.",
    suggestion: "Utilisez la méthode de connexion d'origine ou liez les comptes depuis vos paramètres.",
    action: "Retour à la connexion",
    icon: XCircle,
    severity: "error"
  },
  LinkRequired: {
    title: "Liaison de compte requise",
    message: "Votre compte Google doit être lié à votre compte existant.",
    suggestion: "Connectez-vous avec vos identifiants habituels pour lier les comptes.",
    action: "Se connecter",
    icon: AlertCircle,
    severity: "warning"
  },
  Verification: {
    title: "Vérification requise",
    message: "Votre email n'a pas encore été vérifié.",
    suggestion: "Vérifiez votre boîte mail pour le lien de vérification.",
    action: "Renvoyer l'email",
    icon: AlertCircle,
    severity: "warning"
  },
  SetupRequired: {
    title: "Configuration requise",
    message: "Votre compte nécessite une configuration supplémentaire.",
    suggestion: "Complétez la configuration de votre compte pour continuer.",
    action: "Configurer le compte",
    icon: AlertCircle,
    severity: "warning"
  },
  Default: {
    title: "Erreur inattendue",
    message: "Une erreur s'est produite lors de l'authentification.",
    suggestion: "Veuillez réessayer ou contacter le support si le problème persiste.",
    action: "Réessayer",
    icon: XCircle,
    severity: "error"
  }
} as const;

type ErrorType = keyof typeof errorMessages;

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = (searchParams.get('error') as ErrorType) || 'Default';
  const errorInfo = errorMessages[errorType];

  // Effet pour afficher un toast d'erreur au chargement
  useEffect(() => {
    toast.error(errorInfo.message, {
      description: errorInfo.suggestion,
      duration: 5000,
    });
  }, [errorType, errorInfo.message, errorInfo.suggestion]);

  // Gestionnaire d'actions en fonction du type d'erreur
  const handleAction = async () => {
    switch (errorType) {
      case 'Verification':
        // Appel à l'API pour renvoyer l'email de vérification
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            toast.success("Email de vérification renvoyé !");
          } else {
            throw new Error("Échec de l'envoi de l'email");
          }
        } catch (error) {
          console.error('❌ [Auth] Error:', error);
          toast.error("Impossible de renvoyer l'email pour le moment");
        }
        break;

      case 'SetupRequired':
        router.push('/auth/setup-google-account');
        break;

      case 'LinkRequired':
      case 'AccessDenied':
        router.push('/auth/signin');
        break;

      default:
        router.refresh();
        break;
    }
  };

  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <IconComponent 
            className={`h-12 w-12 ${
              errorInfo.severity === 'error' ? 'text-destructive' : 'text-warning'
            }`} 
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {errorInfo.title}
          </h1>
        </div>

        <Alert 
          variant={errorInfo.severity === 'error' ? 'destructive' : 'default'}
        >
          <AlertTitle>{errorInfo.message}</AlertTitle>
          <AlertDescription>{errorInfo.suggestion}</AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-4">
          <Button 
            onClick={handleAction}
            className="w-full flex items-center justify-center gap-2"
          >
            {errorType === 'Default' ? (
              <RefreshCcw className="h-4 w-4" />
            ) : null}
            {errorInfo.action}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}