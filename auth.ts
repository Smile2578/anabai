// auth.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/connection";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // Réutilisez les configurations Edge-compatibles
  ...authConfig,
  providers: [
    ...(authConfig.providers || []),
    // Ajoutez le CredentialsProvider ici
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Votre logique d'autorisation avec mongoose et bcryptjs
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
          
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
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
  // Ajoutez vos callbacks ici
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "admin" | "editor" | "user" | "premium" | "luxury";
        token.name = user.name as string;
        token.email = user.email as string;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "editor" | "user" | "premium" | "luxury";
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  // Autres options spécifiques à Node.js
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
