'use client'

import { useState, useEffect } from 'react'
import { createAuthClient } from 'better-auth/react'

let authClient: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (!authClient) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    authClient = createAuthClient({
      baseURL: `${baseUrl}/api/auth`,
    })
  }
  return authClient
}

export { getAuthClient }

export interface UserSession {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt?: string
}

export function useSession() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const result = await getAuthClient().getSession()
        if (result.data?.user) {
          setUser({
            id: result.data.user.id,
            name: result.data.user.name || '',
            email: result.data.user.email || '',
            image: result.data.user.image,
            createdAt: result.data.user.createdAt?.toString(),
          })
        }
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  const signOut = async () => {
    try {
      await getAuthClient().signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return { user, loading, signOut }
}
