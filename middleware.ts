import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  console.log('Middleware token:', token);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!token) {
      console.log('User not authenticated');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
    if (token.role !== 'admin') {
      console.log('Access denied. Role:', token.role);
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Access granted. Role:', token.role);
  }

  return NextResponse.next(); // Continue la requête normalement
}

export const config = {
  matcher: ['/admin/:path*'], // Appliquer le middleware aux routes /admin
};
