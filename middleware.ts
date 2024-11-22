import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;
console.log('NEXTAUTH_SECRET in middleware:', secret);

async function verifyTokenManually(token: string, secret: string) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    console.log('Manual token verification payload:', payload);
    return payload;
  } catch (error) {
    console.error('Manual token verification failed:', error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  console.log('Request URL:', req.nextUrl.href);
  console.log('Request Pathname:', req.nextUrl.pathname);

  const cookies = req.cookies.getAll();
  console.log('Request cookies:', cookies);

  // Récupérer le token brut du cookie
  const rawToken = req.cookies.get('__Secure-next-auth.session-token')?.value;
  console.log('Raw session token cookie:', rawToken);

  // Décoder le token via getToken
  const token = await getToken({ req, secret });
  console.log('Decoded token using getToken:', token);

  // Si getToken échoue, tenter une vérification manuelle
  const manualToken = rawToken ? await verifyTokenManually(rawToken, secret!) : null;
  console.log('Manually decoded token:', manualToken);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token && !manualToken) {
      console.log('User not authenticated. Redirecting to /auth/signin');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const role = token?.role || manualToken?.role;
    if (role !== 'admin') {
      console.log(`Access denied. Role found: ${role}`);
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log('Access granted. Role:', role);
  }

  return NextResponse.next(); // Continuer la requête normalement
}

export const config = {
  matcher: ['/admin/:path*'],
};
