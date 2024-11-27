// lib/auth/protect-api.ts
import { auth } from "@/auth"
import { NextResponse } from 'next/server'
import { Session } from 'next-auth'

export type SessionWithUser = Session & {
  user: {
    role?: string
  }
}

export function protectApiRoute(
  handler: (req: Request, session: SessionWithUser) => Promise<NextResponse>,
  requiredRole: 'admin' | 'editor' = 'admin'
) {
  return async function protectedHandler(req: Request) {
    try {
      const session = await auth() as SessionWithUser | null

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        )
      }

      if (!session.user.role || (requiredRole === 'admin' && session.user.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        )
      }

      return handler(req, session)
    } catch (error) {
      console.error('API Protection Error:', error)
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      )
    }
  }
}