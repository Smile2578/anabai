// app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AnabaLogo from '@/components/brand/AnabaLogo'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { handleAuthError } from '@/lib/errors/auth-errors'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const { setLoadingState, setError, setUser, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [SignIn] Starting login process with email:', email)
    
    setIsLoading(true)
    setLoadingState('loading')
    setError(null)

    try {
      console.log('📡 [SignIn] Calling Supabase auth.signInWithPassword')
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📦 [SignIn] Response:', { user, session, error: signInError })

      if (signInError) {
        console.error('❌ [SignIn] Authentication error:', signInError)
        const { message } = handleAuthError(signInError)
        toast.error(message, {
          duration: 4000,
          position: 'top-center',
        })
        setError(message)
        setLoadingState('error')
        return
      }

      if (user && session) {
        console.log('✅ [SignIn] Authentication successful, user:', user)
        setUser(user)
        setLoadingState('success')
        
        toast.success('Connexion réussie !', {
          duration: 4000,
          position: 'top-center',
        })

        // Attendre que la session soit mise à jour avant de rediriger
        console.log('⏳ [SignIn] Waiting for session update before redirect')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('🔄 [SignIn] Refreshing router')
        router.refresh()
        
        console.log('➡️ [SignIn] Redirecting to:', callbackUrl)
        router.replace(callbackUrl)
      } else {
        console.error('❌ [SignIn] No user or session in response')
        const { message } = handleAuthError(new Error('No user or session'))
        setError(message)
        setLoadingState('error')
      }
    } catch (error) {
      console.error('❌ [SignIn] Unexpected error:', error)
      const { message } = handleAuthError(error as Error)
      setError(message)
      setLoadingState('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('🚀 [SignIn] Starting Google login process')
    setLoadingState('loading')
    
    try {
      console.log('📡 [SignIn] Calling Supabase auth.signInWithOAuth')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${callbackUrl}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
        }
      })

      console.log('📦 [SignIn] Google OAuth response:', { data, error })

      if (error) {
        console.error('❌ [SignIn] Google authentication error:', error)
        const { message } = handleAuthError(error)
        toast.error(message, {
          duration: 4000,
          position: 'top-center',
        })
        setError(message)
        setLoadingState('error')
        return
      }
      
      console.log('✅ [SignIn] Google authentication initiated successfully')
      setLoadingState('success')
    } catch (error) {
      console.error('❌ [SignIn] Unexpected Google authentication error:', error)
      const { message } = handleAuthError(error as Error)
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
      })
      setError(message)
      setLoadingState('error')
    } finally {
      setIsLoading(false)
    }
  }

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
                onClick={handleGoogleSignIn}
                disabled={isLoading}
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