'use client'

import { useSupabaseClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Provider } from '@supabase/supabase-js'

export function LoginButton() {
  const [loading, setLoading] = useState<Provider | null>(null)
  const supabase = useSupabaseClient()

  const handleLogin = async (provider: Provider) => {
    try {
      setLoading(provider)
      const options: {
        redirectTo: string
        scopes?: string
        queryParams?: {
          access_type: string
          prompt: string
        }
      } = {
        redirectTo: `${window.location.origin}/auth/callback`,
      }

      if (provider === 'azure') {
        options.scopes = 'email openid profile User.Read'
      } else if (provider === 'google') {
        options.queryParams = {
          access_type: 'offline',
          prompt: 'consent',
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      })

      if (error) {
        console.error('Error signing in:', error)
        alert('Error signing in: ' + error.message)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3 w-full">
      <button
        onClick={() => handleLogin('google')}
        disabled={!!loading}
        className="flex h-12 w-full items-center justify-center gap-3 bg-cream border-2 border-ink px-5 text-ink hover:bg-zinc-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-black dark:border-cream dark:text-cream dark:hover:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        {loading === 'google' ? (
          'Connecting...'
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <button
        onClick={() => handleLogin('azure')}
        disabled={!!loading}
        className="flex h-12 w-full items-center justify-center gap-3 bg-ink border-2 border-hoops px-5 text-cream hover:border-hoops hover:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-cream dark:border-hoops dark:text-ink dark:hover:bg-zinc-100 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        {loading === 'azure' ? (
          'Connecting...'
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Sign in with Microsoft
          </>
        )}
      </button>
    </div>
  )
}
