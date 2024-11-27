// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  try {
    // Configuration du token avec les bonnes options
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: 'next-auth.session-token', // Spécifier explicitement le nom du cookie
    });

    console.log('🔍 [Middleware] Token check:', {
      token,
      path: req.nextUrl.pathname,
      cookies: req.cookies.getAll(),
      env: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasUrl: !!process.env.NEXTAUTH_URL,
      }
    });

    // Si pas de token, essayer de vérifier la session via l'API
    if (!token) {
      try {
        const sessionRes = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        });

        const session = await sessionRes.json();

        if (session?.user) {
          // Si on a une session valide, permettre l'accès
          if (req.nextUrl.pathname.startsWith('/admin') && session.user.role === 'admin') {
            return NextResponse.next();
          }
          if (req.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.next();
          }
        }
      } catch (error) {
        console.error('❌ [Middleware] Session check failed:', error);
      }

      // Si on arrive ici, pas de session valide
      console.log('❌ [Middleware] Access denied: No valid session');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Vérification des rôles pour les routes admin
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token.role || !['admin', 'editor'].includes(token.role as string)) {
        console.log('❌ [Middleware] Admin access denied:', { role: token.role });
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Ajouter des headers de sécurité
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
  } catch (error) {
    console.error('❌ [Middleware] Error:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*'
  ]
};