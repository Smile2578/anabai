import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;

  console.log('Request URL:', req.nextUrl.href);
  console.log('Request Pathname:', req.nextUrl.pathname);

  // Récupérer le token JWT depuis les cookies
  const token = await getToken({ req, secret });

  console.log('Middleware token:', token);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      console.log('User not authenticated. Redirecting to /auth/signin');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (token.role !== 'admin') {
      console.log(`Access denied. Role found: ${token.role}`);
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Access granted. Role:', token.role);
  }

  return NextResponse.next(); // Continuer la requête normalement
}

export const config = {
  matcher: ['/admin/:path*'], // Appliquer le middleware uniquement aux routes commençant par /admin
};
