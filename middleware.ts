// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  // Protéger les routes admin et api/admin
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!token) {
      // Pour les appels API, renvoyer 401
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 401 }
        );
      }
      
      // Pour les routes normales, rediriger vers login
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Vérifier le rôle pour les routes admin
    if (token.role !== 'admin' && token.role !== 'editor') {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Accès interdit' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

// Configurer sur quels chemins le middleware doit s'exécuter
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};