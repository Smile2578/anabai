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
      async authorize(credentials: { email: string; password: string } | undefined) {
        console.log('Authorize function called with credentials:', credentials);
        if (!credentials) {
          console.log('No credentials provided');
          throw new Error('Identifiants requis');
        }
        await connectDB();
        console.log('Connected to database');
        const user = await User.findOne({ email: credentials.email })
          .select('+password') as IUser | null;
        if (!user) {
          console.log('No user found with email:', credentials.email);
          throw new Error('Aucun utilisateur trouvé');
        }
        console.log('User found:', user.email);
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log('Invalid password for user:', user.email);
          throw new Error('Mot de passe incorrect');
        }
        console.log('Password valid for user:', user.email);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  },
  callbacks: {
    async jwt({ token, user, session }) {
      // Mise à jour lors de la connexion
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }

      // Mise à jour lors de la modification de session
      if (session) {
        token = { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
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
}

console.log('AuthOptions configured with secret:', process.env.NEXTAUTH_SECRET ? 'Secret is set' : 'Secret is not set');

