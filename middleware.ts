// middleware.ts

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware started for URL:', req.url);
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);

  const token = await getToken({ req });

  console.log('Decoded token:', token);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('Accessing admin route');
    if (!token) {
      console.log('No token found, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    if (token.role !== 'admin') {
      console.log('User is not an admin, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    console.log('Access granted. Role:', token.role);
  }

  console.log('Middleware completed');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
