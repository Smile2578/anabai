// auth.ts
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session extends DefaultSession {
    error?: string;
  }
}

const config = {
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "editor" | "user" | "premium" | "luxury";
        session.user.status = token.status as "active" | "inactive" | "pending_verification";
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 [Auth/Events] SignIn event:', {
        user: user.email,
        username: user.name,
        provider: account?.provider,
        isNewUser
      });
    },
    async createUser({ user }) {
      console.log('👥 [Auth/Events] User created:', user.email, user.name);
    },
    async linkAccount({ user, account }) {
      console.log('🔗 [Auth/Events] Account linked:', {
        user: user.email,
        provider: account.provider
      });
    },
    async session({ session, token }) {
      console.log('📅 [Auth/Events] Session updated:', {
        user: session?.user?.email,
        token: !!token
      });
    }
  }
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);