// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware - Processing URL:', req.nextUrl.pathname);
  
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('Middleware - Token:', token);

  // Protéger les routes admin et api/admin
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!token) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};