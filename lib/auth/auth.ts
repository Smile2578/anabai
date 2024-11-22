// lib/auth.ts
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
            const dbConnectionStart = Date.now();
            await connectDB();
            console.log('Database connected in', Date.now() - dbConnectionStart, 'ms');
  
            const userLookupStart = Date.now();
            const user = await User.findOne({ email: credentials?.email })
              .select('+password') as IUser | null;
            console.log('User lookup completed in', Date.now() - userLookupStart, 'ms');
  
            if (!user) {
              console.log('No user found with this email');
              throw new Error('Aucun utilisateur trouvé avec cet email');
            }
  
            const passwordCompareStart = Date.now();
            const isValid = await bcrypt.compare(credentials!.password, user.password);
            console.log('Password comparison completed in', Date.now() - passwordCompareStart, 'ms');
  
            if (!isValid) {
              console.log('Invalid password');
              throw new Error('Mot de passe incorrect');
            }
  
            console.log('User authenticated successfully');
  
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
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};

authOptions.providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectDB();
  
          const user = await User.findOne({ email: credentials?.email })
            .select('+password') as IUser | null;
  
          if (!user) {
            throw new Error('Aucun utilisateur trouvé avec cet email');
          }
  
          const isValid = await bcrypt.compare(credentials!.password, user.password);
  
          if (!isValid) {
            throw new Error('Mot de passe incorrect');
          }
  
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
    })
  );
