// app/auth/signin/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AnabaLogo from '@/components/brand/AnabaLogo'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignInPage() {
  // Hooks pour la navigation et la gestion des paramètres
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  // Sélecteurs optimisés du store d'authentification
  const setLoadingState = useAuthStore(state => state.setLoadingState)
  const setError = useAuthStore(state => state.setError)
  const error = useAuthStore(state => state.error)
  
  // États locaux pour le formulaire
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Gestionnaire de soumission du formulaire avec gestion complète des erreurs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [SignIn] Starting login process')
    
    setIsLoading(true)
    setLoadingState('loading')
    setError(null)
  
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl
      })
  
      if (result?.error) {
        toast.error(result.error, {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }
  
      toast.success('Connexion réussie !', {
        duration: 4000,
        position: 'top-center',
      });
  
      // Attendre un peu plus longtemps pour la propagation de la session
      await new Promise(resolve => setTimeout(resolve, 500))
  
      // Vérifier la session différemment
      const session = await fetch('/api/auth/session')
      const sessionData = await session.json()
  
      if (sessionData?.user) {
        console.log('✅ [SignIn] Authentication successful')
        router.push(callbackUrl)
        router.refresh()
      } else {
        throw new Error('Échec de l\'authentification')
      }
  
    } catch (error) {
      console.error('❌ [SignIn] Authentication error:', error)
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
      setLoadingState('idle')
    }
  }
  
  // Monitoring des cookies
  useEffect(() => {
    const checkCookies = () => {
      const cookies = parseCookies(document.cookie)
      console.log('🍪 [SignIn] Cookie status:', {
        all: cookies,
        sessionToken: cookies['next-auth.session-token' as keyof typeof cookies],
        secureSessionToken: cookies['__Secure-next-auth.session-token' as keyof typeof cookies]
      })
    }

    const parseCookies = (cookieStr: string) => {
      return cookieStr.split(';')
        .map(pair => pair.trim().split('='))
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value
        }), {})
    }

    checkCookies()
    // Vérification périodique des cookies pendant 5 secondes
    const interval = setInterval(checkCookies, 1000)
    const timeout = setTimeout(() => clearInterval(interval), 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      <Toaster richColors />
      <div className="auth-container flex items-center justify-center min-h-screen bg-background">
        <div className="auth-card w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
          <div className="auth-form-container space-y-6">
            {/* En-tête avec logo et sous-titre */}
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <AnabaLogo />
              </div>
              <p className="auth-subtitle text-muted-foreground mt-2">
                Découvrez le Japon authentique
              </p>
            </div>
            
            {/* Affichage des erreurs */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Formulaire de connexion */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input h-11 px-4 bg-input"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input h-11 px-4 bg-input"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              
              {/* Bouton de connexion avec état de chargement */}
              <Button 
                type="submit" 
                className="auth-button w-full h-11 bg-primary hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Se connecter'
                )}
              </Button>
              
              {/* Lien mot de passe oublié */}
              <Link 
                href="/auth/forgot-password" 
                className="auth-link block mt-2 text-secondary hover:text-secondary/80 text-sm"
              >
                Mot de passe oublié ?
              </Link>
            </form>
            
            {/* Séparateur */}
            <div className="auth-divider relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>
            
            {/* Bouton de connexion Google */}
            <div className="space-y-3">
              <button 
                className="auth-social-button w-full h-11 px-4 flex items-center justify-center gap-2 border border-input rounded-md hover:bg-accent/50 transition-colors"
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
              >
                <Image 
                  src="/google-icon.png" 
                  alt="Google" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5"
                />
                Continuer avec Google
              </button>
            </div>
            
            {/* Lien d'inscription */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Pas de compte ?{' '}<br />
                <Link 
                  href="/auth/signup" 
                  className="auth-link text-primary hover:text-primary/80 text-xl font-semibold"
                >
                  Inscrivez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}