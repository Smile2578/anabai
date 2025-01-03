// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🚀 [Middleware] URL demandée:', request.nextUrl.pathname)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Vérifier si la route est protégée
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/questionnaire')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  console.log('🔒 [Middleware] Route protégée:', isProtectedRoute)
  console.log('🔑 [Middleware] Route auth:', isAuthRoute)
  console.log('👑 [Middleware] Route admin:', isAdminRoute)

  console.log('🔄 [Middleware] Vérification de l\'authentification...')

  // Récupérer la session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('❌ [Middleware] Erreur session:', sessionError)
  }

  // Récupérer l'utilisateur
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('❌ [Middleware] Erreur utilisateur:', userError)
  }

  // Log des tokens et des rôles
  if (session) {
    console.log('🎫 [Middleware] Access Token:', session.access_token)
    console.log('🔐 [Middleware] Refresh Token:', session.refresh_token)
    try {
      const decodedToken = JSON.parse(atob(session.access_token.split('.')[1]))
      console.log('🔍 [Middleware] Token décodé:', decodedToken)
      console.log('👤 [Middleware] Rôle dans le token:', decodedToken.role)
      console.log('📝 [Middleware] Métadonnées:', decodedToken.user_metadata)
    } catch (error) {
      console.error('❌ [Middleware] Erreur décodage token:', error)
    }
  }

  if (user) {
    console.log('📋 [Middleware] Utilisateur authentifié:', {
      email: user.email,
      systemRole: 'authenticated',
      userRole: user.user_metadata?.role || 'user'
    })
  }

  // Redirection selon le statut d'authentification
  if (isAuthRoute && user) {
    console.log('ℹ️ [Middleware] Redirection d\'une route auth vers /')
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isProtectedRoute && !user) {
    console.log('ℹ️ [Middleware] Redirection vers /auth/signin')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (isAdminRoute && (!user || user.user_metadata?.role !== 'admin')) {
    console.log('ℹ️ [Middleware] Redirection d\'une route admin vers /')
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log('✅ [Middleware] Accès autorisé')
  return response
}

export const config = {
  matcher: [
    '/questionnaire/:path*',
    '/auth/:path*',
    '/admin/:path*',
    '/'
  ]
}