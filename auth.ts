// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      if (trigger === "update" && session) {
        return { ...token, ...session }
      }
      return token
    },

    async session({ session, token }) {

      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
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