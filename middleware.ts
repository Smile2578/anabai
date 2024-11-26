// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Clé secrète utilisée pour signer les JWT (doit correspondre à AUTH_SECRET)
const secret = process.env.AUTH_SECRET
console.log('🚀 [middleware] secret:', secret);

export async function middleware(req: NextRequest) {
  // Récupérer le token JWT depuis les cookies
  const token = await getToken({ req, secret, raw: true });

  // URL de la requête
  const { pathname } = req.nextUrl;

  // Vérifier si le token existe (utilisateur authentifié)
  if (!token) {
    // Rediriger vers la page de connexion si non authentifié
    const signInUrl = new URL('/auth/signin', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Décoder le token pour accéder aux informations de l'utilisateur
  const decodedToken = await getToken({ req, secret });

  // Vérifier le rôle de l'utilisateur pour les pages admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const userRole = decodedToken?.role;

    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      // Rediriger ou renvoyer une réponse 403 si l'utilisateur n'a pas le rôle requis
      if (pathname.startsWith('/api')) {
        return new NextResponse(JSON.stringify({ error: 'Accès non autorisé' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  // Autoriser la requête à continuer
  return NextResponse.next();
}

// Configuration des routes protégées par le middleware
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
