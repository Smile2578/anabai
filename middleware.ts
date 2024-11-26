// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// middleware.ts
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // Routes protégées par rôle
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!token || !['admin', 'editor'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }

  // Routes protégées par authentification
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
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