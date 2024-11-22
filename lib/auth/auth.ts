import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
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
        if (!credentials) throw new Error('Identifiants requis');
        await connectDB();
        const user = await User.findOne({ email: credentials.email })
          .select('+password') as IUser | null;
        if (!user) throw new Error('Aucun utilisateur trouvé');
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Mot de passe incorrect');
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Désactive le chiffrement, utilise des JWT signés
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET, // Clé utilisée pour signer les JWT
    maxAge: 30 * 24 * 60 * 60, // Durée de vie des JWT
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
      };
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
