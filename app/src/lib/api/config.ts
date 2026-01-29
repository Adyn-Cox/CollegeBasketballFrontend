/**
 * API Configuration
 * 
 * Centralized configuration for all API calls.
 * Uses proxy for client-side, direct URL for server-side.
 */

/**
 * Direct backend URL for server-side API calls (API routes, server components).
 * Server-side code can't use the proxy - needs the full URL.
 */
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

/**
 * Base URL for client-side API calls.
 * Uses Next.js rewrites to proxy through /backend/*
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/backend'

/**
 * Check if code is running on the server
 */
export const isServer = typeof window === 'undefined'

/**
 * Get the appropriate base URL depending on environment
 */
export function getBaseUrl(): string {
  return isServer ? `${BACKEND_URL}/api` : API_BASE_URL
}

/**
 * Default request timeout in milliseconds
 */
export const DEFAULT_TIMEOUT = 30000

/**
 * Number of retry attempts for failed requests
 */
export const DEFAULT_RETRIES = 2

/**
 * Build a full API URL from a path
 */
export function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${normalizedPath}`
  
  if (!params) return url
  
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  }
  
  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Standard headers for JSON API requests
 */
export function getJsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  }
}

/**
 * Auth headers with Bearer token
 */
export function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}
