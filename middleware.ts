// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log('Middleware token role:', token?.role);
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }

      // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
      if (token.role !== 'admin') {
        console.log('Middleware token role:', token.role);
        return NextResponse.redirect(new URL('/', req.url));
      }
      console.log('Middleware token role:', token.role);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === 'admin',
    },    
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
