// lib/auth/protect-api.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export interface SessionWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  }
}

export type RouteContext = Promise<Record<string, string>>;

export type RouteParams = {
  params: RouteContext;
  searchParams?: Record<string, string>;
  placeId?: string;
};

export function protectApiRoute(
  handler: (
    req: NextRequest,
    session: SessionWithUser,
    routeParams: RouteParams
  ) => Promise<NextResponse>,
  requiredRole: 'admin' | 'editor' = 'admin'
) {
  return async function protectedHandler(
    req: NextRequest,
    context: { params: RouteContext }
  ) {
    try {
      const session = await auth() as SessionWithUser | null;

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
      }

      if (!session.user.role || (requiredRole === 'admin' && session.user.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const routeParams: RouteParams = {
        params: context.params,
        searchParams: Object.fromEntries(req.nextUrl.searchParams),
        placeId: req.nextUrl.searchParams.get('placeId') || undefined
      };

      return handler(req, session, routeParams);
    } catch (error) {
      console.error('API Protection Error:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }
  };
}