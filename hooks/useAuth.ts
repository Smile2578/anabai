'use client'

// hooks/useAuth.ts
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

export function useAuth(requiredRole?: 'admin' | 'editor') {
  const { data: session, status } = useSession()
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser(session.user)
    } else if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [session, status, setUser])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (requiredRole && session?.user?.role !== requiredRole) {
      router.push('/')
    }
  }, [status, session, requiredRole, router])

  return { session, status }
}