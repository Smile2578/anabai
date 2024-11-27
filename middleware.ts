// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Configuration des routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/admin', '/api/admin']
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(req: NextRequest) {
  console.log('🚀 [Middleware] Checking request:', req.nextUrl.pathname)

  // Récupération du token avec une meilleure gestion des erreurs
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  }).catch(error => {
    console.error('🔥 [Middleware] Token error:', error)
    return null
  })

  const { pathname, search } = req.nextUrl
  console.log('🔑 [Middleware] Token status:', token ? 'Present' : 'Missing')

  // Gestion des routes d'authentification (éviter les boucles infinies)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      console.log('👉 [Middleware] Authenticated user trying to access auth route')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Vérification de l'authentification pour les routes protégées
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      console.log('❌ [Middleware] Access denied: No token')
      // Construction de l'URL de redirection avec le callback
      const signInUrl = new URL('/auth/signin', req.url)
      const callbackUrl = pathname + search
      signInUrl.searchParams.set('callbackUrl', callbackUrl)
      return NextResponse.redirect(signInUrl)
    }

    // Vérification spécifique pour les routes admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const userRole = token.role as string
      
      if (!['admin', 'editor'].includes(userRole)) {
        console.log('❌ [Middleware] Unauthorized admin access:', userRole)
        return NextResponse.redirect(new URL('/', req.url))
      }
      console.log('✅ [Middleware] Admin access granted:', userRole)
    }
  }

  // Amélioration de la gestion des erreurs de token
  if (token?.error) {
    console.error('🔥 [Middleware] Token error:', token.error)
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
}

// Configuration des chemins à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /api/auth (NextAuth.js internals)
     * 3. /public (public files)
     * 4. /_vercel (Vercel internals)
     * 5. Static files (/favicon.ico, /sitemap.xml, /robots.txt)
     */
    '/((?!_next/|_vercel/|public/|api/auth/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}