'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLogoUrl } from '@/lib/logoApi'
import { useTheme } from 'next-themes'

interface TeamLogoProps {
  teamName: string
  /** Precomputed logo URL (e.g. from CSV) — use when available for instant load, no async lookup */
  logoUrl?: string | null
  size?: number
  className?: string
  alt?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * Displays team logos from local SVG files.
 * Pass logoUrl when you already have it (e.g. from loadTeamsFromCSV) for instant render.
 * Otherwise resolves URL from team name (async) and switches light/dark with theme.
 */
export function TeamLogo({ teamName, logoUrl: propLogoUrl, size = 32, className = '', alt }: TeamLogoProps) {
  // If propLogoUrl is provided, we don't need to fetch
  const hasProvidedUrl = propLogoUrl != null
  
  // Determine initial status based on props
  const getInitialStatus = (): Status => {
    if (hasProvidedUrl) return 'success'
    if (!teamName) return 'error'
    return 'loading'
  }
  
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>(getInitialStatus)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Track if we've started fetching for the current props
  const fetchKeyRef = useRef<string>('')

  // Async logo resolution
  useEffect(() => {
    // Skip if we have a provided URL or no team name
    if (hasProvidedUrl || !teamName) {
      return
    }

    // Create a unique key for this fetch
    const fetchKey = `${teamName}-${isDark}`
    
    // Skip if we're already fetching this exact combination
    if (fetchKeyRef.current === fetchKey) {
      return
    }
    fetchKeyRef.current = fetchKey

    let cancelled = false

    getLogoUrl(teamName, isDark)
      .then((url) => {
        if (cancelled) return
        if (url) {
          setResolvedUrl(url)
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [teamName, isDark, hasProvidedUrl])

  // Handle image load error
  const handleError = useCallback(() => {
    setStatus('error')
  }, [])

  // Determine the final URL
  const logoUrl = hasProvidedUrl ? propLogoUrl : resolvedUrl

  // Loading state
  if (status === 'loading') {
    return (
      <div
        className={`bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Error or no URL state
  if (status === 'error' || !logoUrl) {
    return (
      <div
        className={`flex-shrink-0 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={teamName}
      >
        <span className="text-[10px] font-mono font-bold text-zinc-400 truncate px-1" style={{ maxWidth: size }}>
          {teamName?.slice(0, 2) ?? '?'}
        </span>
      </div>
    )
  }

  // Success state - render image
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={alt ?? `${teamName} logo`}
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      loading="lazy"
      onError={handleError}
      style={{ width: size, height: size }}
    />
  )
}
