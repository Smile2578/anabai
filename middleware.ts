// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Configuration pour le withAuth
const authMiddleware = withAuth(
  function middleware(req) {
    console.log('🔒 [Middleware] Starting check:', {
      path: req.nextUrl.pathname,
      hasToken: !!req.nextauth.token
    });

    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') || 
                        req.nextUrl.pathname.startsWith('/api/admin');

    // Log détaillé du token
    console.log('🔑 [Middleware] Token details:', {
      id: token?.id,
      name: token?.name,
      role: token?.role,
      path: req.nextUrl.pathname
    });

    // Vérification spécifique pour les routes admin
    if (isAdminRoute) {
      if (!['admin', 'editor'].includes(token?.role as string)) {
        console.log('❌ [Middleware] Access denied to admin route:', {
          role: token?.role,
          path: req.nextUrl.pathname
        });
        return NextResponse.redirect(new URL('/', req.url));
      }
      console.log('✅ [Middleware] Admin access granted:', {
        role: token?.role,
        path: req.nextUrl.pathname
      });
    }

    console.log('✅ [Middleware] Access granted:', {
      path: req.nextUrl.pathname,
      role: token?.role
    });

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('🔍 [Middleware] Authorization check:', {
          hasToken: !!token,
          path: req.nextUrl.pathname
        });
        return !!token;
      }
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Configuration des routes à protéger
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/account/:path*',
    '/api/admin/:path*'
  ]
};

export default authMiddleware;