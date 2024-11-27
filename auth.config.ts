// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  // Configuration des providers d'authentification
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  
  // Configuration des pages personnalisées
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    // Vous pouvez aussi personnaliser d'autres pages si nécessaire
    // signOut: '/auth/signout',
    // newUser: '/auth/new-user'
  },

  // Configuration des callbacks pour la gestion des tokens et sessions
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (isLoggedIn && auth?.user?.role === 'admin') return true;
        return false; // Rediriger vers la page de connexion
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Rediriger vers la page de connexion
      }

      return true;
    },
  },

  // Configuration de la session et des jetons
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },

  // Options de sécurité
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
};