'use client'

import { Dashboard } from "@/components/Dashboard"
import { useSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user: User } | null } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      } else if (_event === 'SIGNED_OUT') {
        setUser(null)
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Redirect to login if not authenticated (after loading complete)
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/?error=session_expired')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream dark:bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-hoops border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <Dashboard user={user} />
}
