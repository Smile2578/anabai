import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;

  console.log('Request URL:', req.nextUrl.href);
  console.log('Request Pathname:', req.nextUrl.pathname);

  // Vérifiez les cookies
  const cookies = req.cookies.getAll();
  console.log('Request cookies:', cookies);

  // Test de récupération brute du cookie
  const rawToken = req.cookies.get('__Secure-next-auth.session-token')?.value;
  console.log('Raw session token cookie:', rawToken);

  // Essayez de décoder le token avec getToken
  const token = await getToken({ req, secret });
  console.log('Decoded token using getToken:', token);

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
