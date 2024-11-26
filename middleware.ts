// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware - Processing URL:', req.nextUrl.pathname);
  
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdmin = token?.role === "admin";
  const isEditor = token?.role === "editor";
  const isPremium = token?.role === "premium";
  const isLuxury = token?.role === "luxury";
  const isUser = token?.role === "user";
  const isAuthenticated = !!token;

  console.log('Middleware - Token:', token);

  // Protéger les routes admin et api/admin
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!isAdmin && !isEditor) {
      console.log('Middleware - No token found, redirecting to signin');
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`, req.url)
      );
    }
  
    // Vérifier le rôle pour les routes admin
    console.log('Middleware - User role:', token.role);
    
    if (!token.role || (token.role !== 'admin' && token.role !== 'editor')) {
      console.log('Middleware - Invalid role for admin access');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/account') || req.nextUrl.pathname.startsWith('/spots')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/anabai')) {
    if (!isPremium && !isLuxury && !isAdmin && !isEditor) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (isUser) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};