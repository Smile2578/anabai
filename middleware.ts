import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  async function middleware(req) {
    let token = req.nextauth.token;

    if (!token) {
      console.log('Token not found in req.nextauth. Fetching manually...');
      token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    }

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
        console.log('Authorized callback token:', token);
        return token?.role === 'admin';
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
