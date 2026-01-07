'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null
let configPromise: Promise<{ url: string; anonKey: string }> | null = null

async function getSupabaseConfig() {
  if (configPromise) {
    return configPromise
  }

  configPromise = fetch('/api/supabase-config')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch Supabase config')
      }
      return response.json()
    })
    .then((config) => {
      if (!config.url || !config.anonKey) {
        throw new Error(
          'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY'
        )
      }
      return config
    })

  return configPromise
}

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // For initial render, we'll create a client that will be initialized
  // This is a fallback - components should use useSupabaseClient hook instead
  throw new Error(
    'Supabase client not initialized. Use useSupabaseClient() hook in client components.'
  )
}

export function useSupabaseClient() {
  const [client, setClient] = useState<ReturnType<typeof createBrowserClient> | null>(
    supabaseClient
  )
  const [loading, setLoading] = useState(!supabaseClient)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (supabaseClient) {
      setClient(supabaseClient)
      setLoading(false)
      return
    }

    setLoading(true)
    getSupabaseConfig()
      .then((config) => {
        supabaseClient = createBrowserClient(config.url, config.anonKey)
        setClient(supabaseClient)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
        console.error('Failed to initialize Supabase client:', err)
      })
  }, [])

  if (error) {
    throw error
  }

  if (loading || !client) {
    // Return null during loading - components should handle this
    return null
  }

  return client
}
