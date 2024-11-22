import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/db/connection';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Authorize function called with email:', credentials?.email);

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials?.email })
            .select('+password') as IUser | null;

          if (!user) {
            console.error('No user found with this email.');
            throw new Error('Aucun utilisateur trouvé avec cet email');
          }

          const isValid = await bcrypt.compare(credentials!.password, user.password);

          if (!isValid) {
            console.error('Invalid password.');
            throw new Error('Mot de passe incorrect');
          }

          console.log('User authenticated successfully:', user.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Error in authorize function:', error);
          throw new Error('Erreur lors de la connexion. Veuillez réessayer plus tard.');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      console.log('JWT token generated:', token);
      console.log('JWT callback secret:', process.env.NEXTAUTH_SECRET);

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
      };
      console.log('Session data:', session);
      console.log('JWT callback secret:', process.env.NEXTAUTH_SECRET);
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
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
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
};
