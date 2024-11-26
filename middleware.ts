// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🛡️ [Middleware] Checking route:', req.nextUrl.pathname);

  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log('🛡️ [Middleware] Token:', token ? 'Present' : 'Missing', token?.role);

  // Protection des routes admin
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!token) {
      console.log('❌ [Middleware] No token for admin route');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (!['admin', 'editor'].includes(token.role as string)) {
      console.log('❌ [Middleware] Invalid role for admin route:', token.role);
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('✅ [Middleware] Admin access granted');
  }

  // Protection des routes authentifiées
  if (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/account')
  ) {
    if (!token) {
      console.log('❌ [Middleware] No token for protected route');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }
    console.log('✅ [Middleware] Access granted to protected route');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*'
  ]
};