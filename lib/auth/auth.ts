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
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback called. Current token:', token);
      console.log('User data:', user);
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      console.log('Updated token:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback called. Current session:', session);
      console.log('Token data:', token);
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
      };
      console.log('Updated session:', session);
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

console.log('AuthOptions configured with secret:', process.env.NEXTAUTH_SECRET ? 'Secret is set' : 'Secret is not set');

