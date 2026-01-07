import { createClient } from '@/lib/supabase/server'
import { backendLogin } from '@/lib/api/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      // Failed to exchange code - redirect to login
      console.error('Failed to exchange code for session:', exchangeError)
      return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
    }

    try {
      // Register/login with backend - must succeed to access dashboard
      await backendLogin(data.session.access_token, data.session.refresh_token)
    } catch (error) {
      // Backend login failed - sign out of Supabase and redirect to login
      console.error('Backend login failed:', error)
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/?error=backend_auth_failed', requestUrl.origin))
    }
  }

  // Success - redirect to dashboard
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
