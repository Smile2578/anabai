import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware started for URL:', req.url);

  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  console.log('Decoded token:', token);

  // Vérifiez si l'URL commence par /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('Accessing admin route');
    
    if (!token) {
      console.log('No token found, redirecting to signin');
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (token.role !== 'admin') {
      console.log('User is not an admin, redirecting to signin');
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Access granted. Role:', token.role);
  }

  return NextResponse.next();
}