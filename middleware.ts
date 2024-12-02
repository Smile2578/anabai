// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
  '/blog'
];

// Routes réservées aux administrateurs et éditeurs
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin'
];

const isPublicRoute = (path: string) => {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
};

const isAdminRoute = (path: string) => {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorer les assets statiques et les routes d'API publiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Permettre l'accès aux routes publiques sans token
    if (isPublicRoute(pathname)) {
      // Si l'utilisateur est déjà connecté et actif, le rediriger vers le dashboard
      if (token?.status === 'active' && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Pour toutes les routes non-publiques, vérifier l'authentification
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Vérifications du statut utilisateur
    if (token.status === 'pending_verification') {
      return NextResponse.redirect(new URL('/auth/verify-email', req.url));
    }

    if (token.status === 'inactive') {
      return NextResponse.redirect(new URL('/auth/inactive', req.url));
    }

    // Vérifier les permissions pour les routes admin
    if (isAdminRoute(pathname)) {
      if (!token.role || !['admin', 'editor'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Si toutes les vérifications sont passées, permettre l'accès
    return NextResponse.next();
  } catch (error) {
    console.error('❌ [Middleware] Error:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /*.* (files with extensions)
     */
    '/((?!api/auth|_next/static|_next/image|static|.*\\..*).*)',
  ],
};