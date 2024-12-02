// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { AuthUser } from "@/types/next-auth";
import connectDB from "@/lib/db/connection";
import DbUser from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import { emailService } from "@/lib/auth/sendEmail";
import { Document, Types } from 'mongoose';

// Interface pour le typage des utilisateurs de la base de données
interface DbUserType extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string | null;
  role: string;
  status: string;
  image?: string;
  lastLogin: Date;
  metadata?: {
    pendingLinkToken?: string;
    pendingLinkProvider?: string;
    pendingLinkEmail?: string;
    pendingLinkExpiry?: Date;
    pendingLinkId?: string;
    pendingLinkName?: string;
  };
}

// Fonction pour générer un token de configuration sécurisé
const generateSetupToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Validité de 24 heures
  return { token, expiry };
};

// Fonction pour générer un token de liaison de compte
const generateLinkToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Validité d'une heure
  return { token, expiry };
};

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user?.email) return false;
        await connectDB();
        
        if (account?.provider === 'google') {
          const email = user.email.toLowerCase().trim();

          // 1. Vérifier d'abord l'existence d'un compte credentials
          const existingCredentialsUser = await DbUser.findOne({ 
            email,
            'providers.credentials': { $exists: true },
            'providers.google': { $exists: false }
          });

          if (existingCredentialsUser) {
            // Forcer la liaison si un compte credentials existe
            const { token, expiry } = generateLinkToken();

            await DbUser.findByIdAndUpdate(existingCredentialsUser._id, {
              $set: {
                'metadata.pendingLinkToken': token,
                'metadata.pendingLinkProvider': 'google',
                'metadata.pendingLinkEmail': email,
                'metadata.pendingLinkExpiry': expiry,
                'metadata.pendingLinkId': profile?.sub,
                'metadata.pendingLinkName': user.name
              }
            });

            return `/auth/link-account?token=${token}&email=${encodeURIComponent(email)}&provider=google`;
          }

          // 2. Vérifier l'existence d'un compte Google
          const existingGoogleUser = await DbUser.findOne({ 
            email,
            'providers.google': { $exists: true }
          });

          if (existingGoogleUser) {
            if (existingGoogleUser.status === 'inactive') {
              return '/auth/error?error=AccountInactive';
            }

            if (existingGoogleUser.status === 'pending_setup') {
              if (!existingGoogleUser.setupToken || 
                  (existingGoogleUser.setupTokenExpiry && existingGoogleUser.setupTokenExpiry < new Date())) {
                const { token, expiry } = generateSetupToken();
                existingGoogleUser.setupToken = token;
                existingGoogleUser.setupTokenExpiry = expiry;
                await existingGoogleUser.save();
                return `/auth/setup-google-account?token=${token}`;
              }
              return `/auth/setup-google-account?token=${existingGoogleUser.setupToken}`;
            }

            if (existingGoogleUser.status === 'active') {
              await DbUser.findByIdAndUpdate(existingGoogleUser._id, {
                $set: {
                  'providers.google': {
                    id: profile?.sub,
                    email: email,
                    lastLogin: new Date(),
                    isConfigured: true
                  },
                  lastLogin: new Date()
                }
              });
              return true;
            }
          }

          // 3. Créer un nouveau compte Google si aucun compte n'existe
          const { token: setupToken, expiry: setupTokenExpiry } = generateSetupToken();
          const newUser = new DbUser({
            name: user.name,
            email: email,
            password: null,
            image: user.image ?? undefined,
            status: 'pending_setup',
            role: 'user',
            setupToken,
            setupTokenExpiry,
            providers: {
              google: {
                id: profile?.sub,
                email: email,
                lastLogin: new Date(),
                isConfigured: false
              }
            }
          });
          
          await newUser.save();

          // Envoyer l'email de bienvenue
          await emailService.sendVerificationEmail(
            newUser.email,
            newUser.name,
            setupToken
          ).catch(error => {
            console.error('❌ [Auth] Erreur envoi email:', error);
          });
          
          return `/auth/setup-google-account?token=${setupToken}`;
        }

        // Gestion de la connexion par credentials
        if (account?.provider === 'credentials') {
          const dbUser = await DbUser.findOne({ 
            email: user.email.toLowerCase().trim() 
          });
          
          if (!dbUser) {
            throw new Error('CredentialsSignin');
          }

          if (dbUser.status === 'pending_verification') {
            throw new Error('Verification');
          }

          if (dbUser.status === 'inactive') {
            throw new Error('UserInactive');
          }

          if (dbUser.status === 'pending_setup') {
            throw new Error('SetupRequired');
          }

          return true;
        }

        return false;
      } catch (error) {
        console.error('❌ [Auth/SignIn] Erreur:', error);
        if (error instanceof Error) {
          return `/auth/error?error=${error.message}`;
        }
        return '/auth/error?error=Default';
      }
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/auth');
      const isSetupPage = nextUrl.pathname === '/auth/setup-google-account';
      const isVerifyPage = nextUrl.pathname === '/auth/verify-email';
      
      if (isSetupPage || isVerifyPage) {
        return true;
      }
      
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      if (!isLoggedIn && nextUrl.pathname.startsWith('/dashboard')) {
        const callbackUrl = nextUrl.pathname + nextUrl.search;
        return Response.redirect(new URL(
          `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          nextUrl
        ));
      }

      return true;
    },

    async jwt({ token, user, account }) {
      try {
        if (user && 'id' in user) {
          const dbUser = await DbUser.findById(user.id) as DbUserType | null;
          
          if (!dbUser) return token;

          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.status = dbUser.status;
       
          await DbUser.findByIdAndUpdate(user.id, {
            lastLogin: new Date(),
            $set: {
              [`providers.${account?.provider}.lastLogin`]: new Date()
            }
          });
        }
        return token;
      } catch (error) {
        console.error('❌ [Auth/JWT] Erreur:', error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          const dbUser = await DbUser.findById(token.id) as DbUserType | null;
          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser._id.toString(),
              role: dbUser.role as AuthUser['role'],
              status: dbUser.status as AuthUser['status'],
              email: dbUser.email,
              name: dbUser.name,
              image: dbUser.image || undefined,
              metadata: dbUser.metadata
            };
          }
          if (token.exp) {
            session.expires = new Date(token.exp * 1000);
          }
        }
        return session;
      } catch (error) {
        console.error('❌ [Auth/Session] Error:', error);
        return session;
      }
    }
  },

  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password || 
            typeof credentials.email !== 'string' || 
            typeof credentials.password !== 'string') {
          throw new Error('InvalidCredentials');
        }

        try {
          await connectDB();
          const email = credentials.email.toLowerCase().trim();
          const dbUser = await DbUser.findOne({ email }).select('+password') as DbUserType | null;

          if (!dbUser) {
            throw new Error('CredentialsSignin');
          }

          if (dbUser.status === 'pending_verification') {
            throw new Error('Verification');
          }

          if (dbUser.status === 'inactive') {
            throw new Error('UserInactive');
          }

          if (!dbUser.password) {
            throw new Error('NoPassword');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            dbUser.password
          );

          if (!isValid) {
            throw new Error('CredentialsSignin');
          }

          return {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: email,
            image: dbUser.image || undefined,
            role: dbUser.role as AuthUser['role'],
            status: dbUser.status as AuthUser['status'],
            lastLogin: new Date()
          };
        } catch (error) {
          console.error('❌ [Auth] Error:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('CredentialsSignin');
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user',
          status: 'pending_setup',
          lastLogin: new Date()
        };
      },
    })
  ],

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 [Auth/Events] SignIn event:', {
        user: user.email,
        provider: account?.provider,
        isNewUser
      });
    },
    async createUser({ user }) {
      console.log('👤 [Auth/Events] New user created:', user.email);
    },
    async linkAccount({ user, account }) {
      console.log('🔗 [Auth/Events] Account linked:', {
        user: user.email,
        provider: account.provider
      });
    },
    async session({ session }) {
      console.log('📅 [Auth/Events] Session updated:', {
        user: session.user.email
      });
    }
  }
};