'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(!supabase)

  useEffect(() => {
    if (!supabase) {
      return
    }

    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
      setLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }

  if (loading) {
    return <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          User Profile
        </h2>
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium text-black dark:text-zinc-50">
          Access Token
        </h3>
        <div className="flex flex-col gap-2">
          <textarea
            readOnly
            value={token || 'No token available'}
            className="w-full p-3 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded resize-none text-zinc-900 dark:text-zinc-100"
            rows={4}
            onClick={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.select()
            }}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Click to select. Copy this token to send to your backend API.
          </p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="flex h-10 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Sign Out
      </button>
    </div>
  )
}
