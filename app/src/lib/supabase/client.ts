'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Browser Client
 * 
 * Uses NEXT_PUBLIC_ env vars which are inlined at build time.
 * No async fetch needed - client is created synchronously.
 */

// Validate env vars at module load (will show clear error in console)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

// Singleton client - created once, reused everywhere
let browserClient: SupabaseClient | null = null

/**
 * Get or create the Supabase browser client.
 * Safe to call multiple times - returns the same instance.
 */
export function getSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return browserClient
}

/**
 * React hook to get the Supabase client.
 * Returns the client directly (never null).
 * 
 * @example
 * const supabase = useSupabaseClient()
 * const { data } = await supabase.auth.getSession()
 */
export function useSupabaseClient(): SupabaseClient {
  // Client is created synchronously - no loading state needed
  return getSupabaseClient()
}

// Legacy export for compatibility
export const createClient = getSupabaseClient
