'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

/**
 * Retrieves the current session access token from Supabase
 * This function must be called from a client component
 * @returns The JWT access token, or null if not authenticated
 */
export function useToken() {
  const supabase = useSupabaseClient()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const getToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setToken(session?.access_token ?? null)
    }

    getToken()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return token
}

/**
 * Retrieves the full session object from Supabase
 * This function must be called from a client component
 * @returns The session object, or null if not authenticated
 */
export function useSession() {
  const supabase = useSupabaseClient()
  const [session, setSession] = useState<any>(null)

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
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return session
}
