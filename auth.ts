// auth.ts
import NextAuth from "next-auth";
import type { User, DefaultSession, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/connection";
import DbUser, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";


  
// Extension des types pour notre application
interface CustomUser extends User {
  id: string;
  role: "admin" | "editor" | "user" | "premium" | "luxury";
  sessionCreated?: number;
}

// Type pour la session étendue
interface ExtendedSession extends DefaultSession {
  user: {
    id: string;
    role: CustomUser['role'];
    sessionCreated: number;
  } & DefaultSession["user"]
}

// Type pour le JWT étendu
interface ExtendedJWT extends JWT {
  id: string;
  role: CustomUser['role'];
  sessionCreated?: number;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(authConfig.providers || []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🚀 [Auth] Starting authorization process');
        
        if (!credentials) {
          console.log('❌ [Auth] No credentials provided');
          throw new Error('Identifiants requis');
        }

        try {
          await connectDB();
          console.log('✅ [Auth] Connected to database');
          
          const dbUser = await DbUser.findOne({ email: credentials.email })
            .select('+password') as IUser | null;
          
          if (!dbUser) {
            console.log('❌ [Auth] No user found:', credentials.email);
            throw new Error('Utilisateur non trouvé');
          }

          const isValid = await bcrypt.compare(
            credentials.password as string, 
            dbUser.password
          );
          
          if (!isValid) {
            console.log('❌ [Auth] Invalid password');
            throw new Error('Mot de passe incorrect');
          }

          console.log('✅ [Auth] Password validated');
          
          const userSession: CustomUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            image: dbUser.image,
            sessionCreated: Date.now()
          };

          return userSession;
        } catch (error) {
          console.error('❌ [Auth] Error during authorization:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }): Promise<ExtendedJWT> {
      if (user) {
        return {
          ...token,
          id: user.id as string,
          role: (user as CustomUser).role,
          name: user.name || '',
          email: user.email || '',
          sessionCreated: (user as CustomUser).sessionCreated
        };
      }

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token as ExtendedJWT;
    },
  
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          name: token.name || '',
          email: token.email || '',
          sessionCreated: token.sessionCreated || Date.now()
        }
      };
    },

    async authorized({ auth }): Promise<boolean> {
      return !!auth?.user;
    }
  },
  events: {
    async signIn({ user }) {
      console.log('🎉 [Auth] User signed in:', user.email);
    },
    async signOut(params) {
      const { token } = params as { session: Session | null; token: ExtendedJWT | null };
      console.log('👋 [Auth] User signed out:', token?.email);
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});