// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Ne traiter que les routes non-API
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: 'next-auth.session-token',
    })

    console.log('🔑 [Middleware] Token check:', {
      token,
      cookies: req.cookies.getAll(),
      path: req.nextUrl.pathname,
      headers: {
        cookie: req.headers.get('cookie'),
      }
    })

    if (!token) {
      // Vérifier si nous avons un cookie de session
      const sessionCookie = req.cookies.get('next-auth.session-token')
      if (!sessionCookie) {
        console.log('❌ [Middleware] No session cookie found')
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Tenter de vérifier la session via l'API
      try {
        const sessionRes = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        })

        const session = await sessionRes.json()
        if (!session?.user) {
          throw new Error('No valid session')
        }

        // Si nous avons une session valide, continuer
        return NextResponse.next()
      } catch {
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Vérification des rôles pour les routes admin
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token.role || !['admin', 'editor'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ [Middleware] Error:', error)
    return NextResponse.redirect(new URL('/auth/error', req.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*'
  ]
}