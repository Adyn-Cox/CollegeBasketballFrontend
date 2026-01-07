'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

/**
 * Client component to ensure Supabase session is initialized
 * This component helps maintain session state across the app
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!supabase) return

    // Initialize session check on mount
    supabase.auth.getSession()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Session state is automatically managed by Supabase through cookies
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <>{children}</>
}
