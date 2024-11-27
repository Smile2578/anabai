// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Ajoutons des logs pour mieux comprendre le flux
  console.log('🚀 [Middleware] Checking authentication for path:', req.nextUrl.pathname);

  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  console.log('🔑 [Middleware] Token status:', token ? 'Present' : 'Missing');

  const { pathname } = req.nextUrl;

  if (!token) {
    console.log('❌ [Middleware] No token found, redirecting to signin');
    // Préservons l'URL de callback pour rediriger après connexion
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Vérification des rôles pour les routes admin
  if (pathname.startsWith('/admin')) {
    console.log('👮 [Middleware] Checking admin access');
    const userRole = token.role as string;
    
    if (!['admin', 'editor'].includes(userRole)) {
      console.log('❌ [Middleware] Unauthorized role:', userRole);
      return NextResponse.redirect(new URL('/', req.url));
    }
    console.log('✅ [Middleware] Admin access granted for role:', userRole);
  }

  return NextResponse.next();
}