// hooks/useAuthError.ts
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Types détaillés pour les erreurs d'authentification
export const authErrorMessages = {
  Signin: "Une erreur s'est produite lors de la connexion",
  OAuthSignin: "Une erreur s'est produite lors de la connexion avec le provider",
  OAuthCallback: "Une erreur s'est produite lors de la réponse du provider",
  OAuthCreateAccount: "Une erreur s'est produite lors de la création du compte",
  EmailCreateAccount: "Une erreur s'est produite lors de la création du compte",
  Callback: "Une erreur s'est produite lors de la connexion",
  OAuthAccountNotLinked: "Cet email est déjà utilisé avec un autre compte",
  EmailSignin: "Une erreur s'est produite lors de l'envoi de l'email",
  CredentialsSignin: "Les identifiants fournis sont incorrects",
  SessionRequired: "Vous devez être connecté pour accéder à cette page",
  Verification: "Veuillez vérifier votre email avant de vous connecter",
  UserInactive: "Votre compte est inactif. Veuillez contacter le support",
  NoPassword: "Ce compte utilise une autre méthode de connexion",
  SetupRequired: "Veuillez terminer la configuration de votre compte",
  Default: "Une erreur inattendue s'est produite"
} as const;

export type AuthErrorType = keyof typeof authErrorMessages;

// Hook pour gérer les erreurs d'authentification
export function useAuthError() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<{
    type: AuthErrorType | null;
    message: string | null;
  }>({ type: null, message: null });

  useEffect(() => {
    const error = searchParams.get('error') as AuthErrorType | null;
    if (error) {
      const message = authErrorMessages[error] || authErrorMessages.Default;
      setErrorInfo({ type: error, message });
      
      // Afficher un toast pour les erreurs importantes
      if (error !== 'CredentialsSignin') {
        toast.error(message);
      }
    }
  }, [searchParams]);

  return errorInfo;
}
