// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import connectDB from "@/lib/db/connection"
import type { AuthUser } from "@/types/auth"
import DbUser from "@/models/User"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  // Configuration des pages personnalisées pour l'authentification
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  callbacks: {
    // Gestion des autorisations et redirections
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/auth')
      
      // Redirection depuis les pages d'authentification si déjà connecté
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true // Autorise l'accès aux pages d'auth si non connecté
      }
      
      // Protection des routes authentifiées
      if (!isLoggedIn && (
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/admin')
      )) {
        // Construction de l'URL de callback
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
          callbackUrl += nextUrl.search
        }
        
        // Redirection vers la page de connexion avec callback
        return Response.redirect(new URL(
          `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          nextUrl
        ))
      }

      return true // Autorise l'accès aux autres pages
    },
    
    // Gestion du JWT
    jwt({ token, user, trigger, session }) {
      // Ajout des informations utilisateur au token lors de la connexion
      if (user) {
        token.id = user.id as string
        token.role = (user as AuthUser).role
      }
      
      // Mise à jour du token lors d'une modification de session
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
      }
      
      return token
    },

    // Configuration de la session utilisateur
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role as AuthUser['role']
        session.user.name = token.name || ''
        session.user.email = token.email || ''
        session.user.image = token.picture || null
      }
      return session
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
          // Nous commençons par une validation de type plus stricte
          if (!credentials?.email || !credentials?.password || 
              typeof credentials.email !== 'string' || 
              typeof credentials.password !== 'string') {
            console.log('❌ [Auth] Invalid credentials format')
            throw new Error('Email et mot de passe requis')
          }

          try {
            await connectDB()
            
            // Maintenant que nous avons validé le type, nous pouvons utiliser toLowerCase()
            const email = credentials.email.toLowerCase().trim()
            
            const dbUser = await DbUser.findOne({ email }).select('+password')

            if (!dbUser) {
              console.log('❌ [Auth] No user found:', email)
              return null
            }

            const isValid = await bcrypt.compare(
              credentials.password,
              dbUser.password
            )

            if (!isValid) {
              console.log('❌ [Auth] Invalid password')
              return null
            }

            const authUser: AuthUser = {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: email, // Utilisation de l'email déjà normalisé
              image: dbUser.image || undefined,
              role: dbUser.role
            }

            console.log('✅ [Auth] User authenticated:', authUser.email)
            return authUser

          } catch (error) {
            console.error('❌ [Auth] Error during authorization:', error)
            return null
          }
        }
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ],
  
  // Configuration de la session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  
  // Activation du mode debug en développement
  debug: process.env.NODE_ENV === 'development'
}