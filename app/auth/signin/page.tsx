// app/auth/signin/page.tsx

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AnabaLogo from '@/components/brand/AnabaLogo';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth, setLoadingState } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [SignIn] Début de la soumission du formulaire');
    setLoading(true);
    setError('');
    setLoadingState('loading');
  
    try {
      console.log('🚀 [SignIn] Tentative de connexion avec NextAuth');
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
  
      if (!res) {
        console.error('❌ [SignIn] Pas de réponse de NextAuth');
        throw new Error('Erreur de connexion inattendue');
      }
  
      if (res.error) {
        console.error('❌ [SignIn] Erreur NextAuth:', res.error);
        setError(res.error);
        setLoadingState('error');
        setLoading(false);
        return;
      }
  
      console.log('✅ [SignIn] Connexion NextAuth réussie, attente de la session');
      // Attendre que NextAuth établisse la session
      await new Promise(resolve => setTimeout(resolve, 500));
  
      console.log('🚀 [SignIn] Récupération de la session');
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      console.log('📦 [SignIn] Données de session reçues:', sessionData);
      
      if (sessionData) {
        console.log('🚀 [SignIn] Mise à jour du store Zustand');
        setAuth(sessionData, true);
        console.log('✅ [SignIn] Store mis à jour');
        
        console.log('🚀 [SignIn] Rafraîchissement du routeur');
        router.refresh();
        
        console.log('🚀 [SignIn] Attente avant redirection');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🚀 [SignIn] Redirection vers:', callbackUrl);
        router.push(callbackUrl);
        setLoadingState('success');
        console.log('✅ [SignIn] Processus de connexion terminé');
      } else {
        console.error('❌ [SignIn] Pas de données de session après connexion');
        throw new Error('Session non établie');
      }
  
    } catch (error) {
      console.error('❌ [SignIn] Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
      setAuth(null, false);
      setLoadingState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container flex items-center justify-center">
      <div className="auth-card w-full max-w-md">
        <div className="auth-form-container">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <AnabaLogo />
            </div>
            
            <p className="auth-subtitle">Découvrez le Japon authentique</p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            <Button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Se connecter'
              )}
            </Button>
            <Link href="/auth/forgot-password" className="auth-link block mt-2 text-secondary-light">
              Mot de passe oublié ?
            </Link>
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
              Pas de compte ? {' '} <br></br>
              <Link href="/auth/signup" className="auth-link text-primary-light text-xl">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}