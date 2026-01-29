'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export interface AuthTokenState {
  token: string | null
  isLoading: boolean
}

/**
 * Retrieves the current session access token from Supabase.
 * Use isLoading so you don't show "Please log in" until the first session check has completed (fixes auth failing on refresh).
 * @returns { token, isLoading } — wait for isLoading false before treating null token as logged out
 */
export function useToken(): AuthTokenState {
  const supabase = useSupabaseClient()
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const getToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!cancelled) setToken(session?.access_token ?? null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    getToken()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setToken(session?.access_token ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  return { token, isLoading }
}

/**
 * Retrieves the full session object from Supabase
 * This function must be called from a client component
 * @returns The session object, or null if not authenticated
 */
export function useSession() {
  const supabase = useSupabaseClient()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      setSession(currentSession)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return session
}
