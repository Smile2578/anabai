// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieStore = new Map(request.cookies)
          return Array.from(cookieStore).map(([name, value]) => ({
            name,
            value: value.value,
          }))
        },
        setAll: (cookiesList) => {
          cookiesList.forEach((cookie) => {
            response.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options,
            })
          })
        },
      },
    }
  )

  try {
    // Rafraîchir la session si nécessaire
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }

    // Vérifier si l'URL actuelle est une route protégée
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/admin')

    // Si c'est une route protégée et qu'il n'y a pas de session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Si c'est une route d'authentification et qu'il y a une session
    if ((request.nextUrl.pathname.startsWith('/auth/signin') || 
         request.nextUrl.pathname.startsWith('/auth/signup')) && 
         session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response

  } catch (error) {
    console.error('❌ [Middleware] Error:', error)
    
    // En cas d'erreur d'authentification, on nettoie les cookies et on redirige
    if (error instanceof Error && (error.name === 'AuthSessionMissingError' || error.name === 'AuthApiError')) {
      response.cookies.set({
        name: 'supabase-auth-token',
        value: '',
        maxAge: 0,
        path: '/',
      })

      // Si c'est une route protégée, rediriger vers la connexion
      if (request.nextUrl.pathname.startsWith('/dashboard') || 
          request.nextUrl.pathname.startsWith('/admin')) {
        const redirectUrl = new URL('/auth/signin', request.url)
        redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  }
}

// Configurer les routes qui doivent passer par le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}