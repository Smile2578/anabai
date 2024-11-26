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

          console.log('✅ [Auth] User found:', { id: user.id, email: user.email, role: user.role });
          
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

          console.log('✅ [Auth] Returning user session:', userSession);
          return userSession;
        } catch (error) {
          console.error('❌ [Auth] Error during authorization:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('🔑 [JWT] Callback triggered:', trigger);
      console.log('🔑 [JWT] Current token:', token);
      console.log('🔑 [JWT] User data:', user);

      if (user) {
        token = { ...token, ...user };
        console.log('✅ [JWT] Token updated with user data:', token);
      }

      return token;
    },
    async session({ session, token }) {
      console.log('👤 [Session] Creating session from token');
      console.log('👤 [Session] Token data:', token);

      if (session?.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as "admin" | "editor" | "user" | "premium" | "luxury",
        };
        console.log('✅ [Session] Session updated:', session);
      }

      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
};