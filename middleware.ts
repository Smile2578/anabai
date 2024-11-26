// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('next-auth.session-token');
  console.log('🔑 [Middleware] Cookie Session Token:', sessionToken ? 'Present' : 'Missing');

  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('🔑 [Middleware] JWT Token:', token ? {
    name: token.name,
    role: token.role,
    path: req.nextUrl.pathname
  } : 'Missing');

  // Gestion des routes protégées
  const protectedRoutes = ['/admin', '/dashboard', '/account', '/api/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      console.log('❌ [Middleware] No token for protected route');
      const callbackUrl = encodeURIComponent(req.url);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url)
      );
    }

    // Vérification spécifique pour les routes admin
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
      if (!['admin', 'editor'].includes(token.role as string)) {
        console.log('❌ [Middleware] Invalid role for admin route:', token.role);
        return NextResponse.redirect(new URL('/', req.url));
      }
      console.log('✅ [Middleware] Admin access granted');
    }

    console.log('✅ [Middleware] Protected route access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/account/:path*',
    '/api/admin/:path*'
  ]
};