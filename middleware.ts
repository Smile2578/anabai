import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;
console.log('NEXTAUTH_SECRET in middleware:', secret);

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  console.log('Decoded token using getToken:', token);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      console.log('Access denied or user not authenticated.');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    console.log('Access granted. Role:', token.role);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
