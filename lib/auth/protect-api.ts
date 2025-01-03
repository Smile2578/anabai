// lib/auth/protect-api.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
      console.log('🔒 [API Protection] Vérification de la session pour:', req.url);
      
      // Créer un client Supabase avec les cookies de la requête
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              const cookie = req.cookies.get(name);
              console.log('🍪 [API Protection] Cookie:', { name, value: cookie?.value });
              return cookie?.value;
            },
          },
        }
      );
      
      console.log('✅ [API Protection] Client Supabase créé');
      
      // Utiliser getUser au lieu de getSession pour plus de sécurité
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('🔍 [API Protection] Utilisateur récupéré:', {
        hasUser: !!user,
        error: error?.message,
        user: user ? {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          role: user.role
        } : null
      });

      if (error || !user) {
        console.error('❌ [API Protection] Auth error:', error);
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
      }

      // Vérifier le rôle dans user_metadata ET dans role
      const userRole = user.user_metadata?.role || user.role || 'user';
      console.log('👤 [API Protection] Rôle utilisateur:', {
        email: user.email,
        metadataRole: user.user_metadata?.role,
        directRole: user.role,
        finalRole: userRole,
        requiredRole
      });

      const sessionWithUser: SessionWithUser = {
        user: {
          id: user.id,
          email: user.email || '',
          role: userRole
        }
      };

      // Vérifier si l'utilisateur a le rôle requis
      const hasRequiredRole = requiredRole === 'editor' 
        ? ['admin', 'editor'].includes(userRole)
        : userRole === requiredRole;

      if (!hasRequiredRole) {
        console.log('🚫 [API Protection] Accès refusé:', {
          userRole,
          requiredRole,
          hasRequiredRole
        });
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }

      console.log('✅ [API Protection] Accès autorisé pour:', {
        email: user.email,
        role: userRole,
        requiredRole
      });

      const routeParams: RouteParams = {
        params: context.params,
        searchParams: Object.fromEntries(req.nextUrl.searchParams),
        placeId: req.nextUrl.searchParams.get('placeId') || undefined
      };

      return handler(req, sessionWithUser, routeParams);
    } catch (error) {
      console.error('❌ [API Protection] Error:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }
  };
}