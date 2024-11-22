import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;

    console.log('Middleware token:', token);

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token) {
        console.log('User not authenticated');
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }

      if (token.role !== 'admin') {
        console.log('Access denied. Role:', token.role);
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log('Access granted. Role:', token.role);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Authorized callback:', token);
        return token?.role === 'admin';
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
