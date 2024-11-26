// lib/auth/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/connection';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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
          
          const user = await User.findOne({ email: credentials.email })
            .select('+password') as IUser | null;
          
          if (!user) {
            console.log('❌ [Auth] No user found:', credentials.email);
            throw new Error('Utilisateur non trouvé');
          }

          console.log('✅ [Auth] User found:', {
            id: user.id,
            email: user.email,
            role: user.role
          });
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log('❌ [Auth] Invalid password');
            throw new Error('Mot de passe incorrect');
          }

          console.log('✅ [Auth] Password validated');
          
          const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
          };

          console.log('✅ [Auth] Created user session:', userSession);
          return userSession;
        } catch (error) {
          console.error('❌ [Auth] Error during authorization:', error);
          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔑 [JWT] Callback triggered:', { trigger, user, token });

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        console.log('✅ [JWT] Token updated with user data:', token);
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
        console.log('✅ [JWT] Token updated from session:', token);
      }

      return token;
    },

    async session({ session, token }) {
      console.log('👤 [Session] Creating session from token:', token);

      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "editor" | "user" | "premium" | "luxury";
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
      }

      console.log('✅ [Session] Final session:', session);
      return session;
    }
  },

  events: {
    async signIn(message) {
      console.log('🔑 [Event] SignIn:', message);
    },
    async signOut(message) {
      console.log('🔑 [Event] SignOut:', message);
    },
    async session(message) {
      console.log('🔑 [Event] Session:', message);
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? '.anaba.io' 
          : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? '.anaba.io' 
          : undefined
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' 
          ? '.anaba.io' 
          : undefined
      }
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};