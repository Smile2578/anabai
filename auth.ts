// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔑 [Auth/JWT] Callback started:', { 
        hasUser: !!user, 
        hasPreviousToken: !!token,
        trigger
      })

      if (user) {
        console.log('👤 [Auth/JWT] Adding user info to token:', { 
          id: user.id,
          role: user.role 
        })
        token.id = user.id as string
        token.role = user.role
      }

      if (trigger === "update" && session) {
        console.log('🔄 [Auth/JWT] Updating token with session:', session)
        return { ...token, ...session }
      }

      console.log('📤 [Auth/JWT] Returning token:', token)
      return token
    },

    async session({ session, token }) {
      console.log('🎫 [Auth/Session] Creating session from token:', { 
        hasToken: !!token,
        sessionBefore: session
      })

      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        console.log('✅ [Auth/Session] Enhanced session:', session)
      }

      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 [Auth/Events] SignIn event:', {
        user: user.email,
        provider: account?.provider,
        isNewUser
      })
    },
    async createUser({ user }) {
      console.log('👥 [Auth/Events] User created:', user.email)
    },
    async linkAccount({ user, account }) {
      console.log('🔗 [Auth/Events] Account linked:', {
        user: user.email,
        provider: account.provider
      })
    },
    async session({ session, token }) {
      console.log('📅 [Auth/Events] Session updated:', {
        user: session?.user?.email,
        token: !!token
      })
    },
  }
})