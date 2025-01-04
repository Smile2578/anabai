// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  console.log('🚀 [Middleware] URL demandée:', request.nextUrl.pathname)

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = await createClient()

  // Vérifier si la route est protégée
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/questionnaire') || 
                          request.nextUrl.pathname.match(/^\/(protected)\/.*$/)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  console.log('🔒 [Middleware] Route protégée:', isProtectedRoute)
  console.log('🔑 [Middleware] Route auth:', isAuthRoute)
  console.log('👑 [Middleware] Route admin:', isAdminRoute)

  // Récupérer la session et l'utilisateur
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('❌ [Middleware] Erreur session:', sessionError)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('❌ [Middleware] Erreur utilisateur:', userError)
  }

  // Logs simplifiés
  if (session) {
    console.log('🎫 [Middleware] Session active')
  }

  if (user) {
    console.log('📋 [Middleware] Utilisateur authentifié:', {
      email: user.email,
      id: user.id
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

  // Vérification admin via la table users
  if (isAdminRoute) {
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (userDataError || !userData || userData.role !== 'admin') {
      console.log('ℹ️ [Middleware] Redirection d\'une route admin vers /')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log('✅ [Middleware] Accès autorisé')
  return response
}

export const config = {
  matcher: [
    '/questionnaire/:path*',
    '/auth/:path*',
    '/admin/:path*',
    '/(protected)/:path*',
    '/'
  ]
}