import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  // Tentez de récupérer le token
  const token = await getToken({ req, secret });

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

  return NextResponse.next(); // Continue la requête normalement
}

export const config = {
  matcher: ['/admin/:path*'],
};
