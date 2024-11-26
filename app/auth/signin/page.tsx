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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
  
      if (res?.error) {
        setError(res.error)
        return
      }
  
      // Mettre à jour le store immédiatement
      useAuthStore.getState().setIsAuthenticated(true)
      
      // Plus besoin d'attendre avec un setTimeout
      router.refresh()
      router.push(callbackUrl)
  
    } catch (error) {
      console.error('Signin error:', error)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

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