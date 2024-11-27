// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { AuthUser } from "@/types/auth"
import connectDB from "@/lib/db/connection"
import DbUser from "@/models/User"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // Configuration complète des cookies - Crucial pour la persistance de session
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 jours en secondes
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60 // 24 heures
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/auth')
      
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true
      }
      
      if (!isLoggedIn && (
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/admin')
      )) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
          callbackUrl += nextUrl.search
        }
        
        return Response.redirect(new URL(
          `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          nextUrl
        ))
      }

      return true
    },
    
    // Gestion du JWT
    async jwt({ token, user, trigger, session }) {
      try {
        console.log('🔑 [Auth/JWT] Processing token:', { 
          hasUser: !!user, 
          trigger,
          currentToken: token 
        })

        if (user) {
          // Ajout des informations utilisateur
          token.id = user.id as string
          token.role = user.role
          
          // Capture de l'IP via token.sub (identifiant unique)
          token.userIP = token.sub || '0.0.0.0'
        }

        if (trigger === "update" && session) {
          console.log('🔄 [Auth/JWT] Updating token with session:', session)
          return { ...token, ...session }
        }

        // Ajout de l'expiration
        token.exp = Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
        
        console.log('📤 [Auth/JWT] Final token:', token)
        return token
      } catch (error) {
        console.error('❌ [Auth/JWT] Error processing token:', error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id
          session.user.role = token.role as AuthUser['role']
          session.user.email = token.email || ''
          
          // Cast pour satisfaire le type Date & string
          session.expires = new Date(token.exp ? token.exp * 1000 : Date.now()) as unknown as Date & string
        }
        return session
      } catch (error) {
        console.error('❌ [Auth/Session] Error creating session:', error)
        return session
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

  
  // Activation du mode debug en développement
  debug: process.env.NODE_ENV === 'development',

  events: {
    async signIn({ user, account, isNewUser }) {
      try {
        console.log('🎉 [Auth/Events] SignIn event:', {
          user: user.email,
          provider: account?.provider,
          isNewUser
        })
      } catch (error) {
        console.error('❌ [Auth/Events] Error in signIn event:', error)
      }
    }
  }
}