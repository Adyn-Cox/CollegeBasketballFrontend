'use client'

import { ThemeProvider } from './theme-provider'
import { SessionProvider } from './auth/SessionProvider'
import { ErrorBoundary } from './ErrorBoundary'
import { preloadTeams } from '@/lib/collegeData'
import { preloadSlugMapping } from '@/lib/logoApi'
import { useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Client-side providers wrapper.
 * Includes error boundary, theme provider, session provider, and data preloading.
 */
export function Providers({ children }: ProvidersProps) {
  // Preload data early for better UX
  useEffect(() => {
    preloadTeams()
    preloadSlugMapping()
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
