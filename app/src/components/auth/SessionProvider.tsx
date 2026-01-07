'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

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
    } = supabase.auth.onAuthStateChange(() => {
      // Session state is automatically managed by Supabase through cookies
      // Parameters are intentionally unused - we just need to subscribe
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <>{children}</>
}
