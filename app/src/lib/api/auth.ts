/**
 * Backend Authentication API Client
 * 
 * Handles communication with the backend for authentication.
 * All endpoints return proper error responses that the frontend handles
 * by redirecting to login on any error.
 */

import { buildUrl, getJsonHeaders, getAuthHeaders } from './config'

// ============================================================================
// Types
// ============================================================================

export interface LoginResponse {
  message: string
  user: {
    supabase_user_id: string
    email: string
    created_at: string
    updated_at: string
  }
  created: boolean
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
}

export interface AuthError {
  error: string
  details?: Record<string, string[]>
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Login/Register user with backend
 * Sends Supabase tokens to backend to create/update user record
 * 
 * @returns LoginResponse on success
 * @throws AuthError on 400/401 - frontend should redirect to login
 */
export async function backendLogin(
  accessToken: string,
  refreshToken: string
): Promise<LoginResponse> {
  const url = buildUrl('/auth/login/')
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`Backend login error (${response.status}):`, responseText)
      try {
        const error = JSON.parse(responseText)
        throw error as AuthError
      } catch (e) {
        if (isAuthError(e)) throw e
        throw { error: `Backend returned ${response.status}: ${responseText.slice(0, 100)}` } as AuthError
      }
    }

    try {
      return JSON.parse(responseText)
    } catch {
      console.error('Invalid JSON from backend:', responseText)
      throw { error: 'Invalid response from backend' } as AuthError
    }
  } catch (error) {
    if (isAuthError(error)) throw error
    console.error('Network error connecting to backend:', error)
    throw { error: 'Failed to connect to backend server' } as AuthError
  }
}

/**
 * Refresh tokens with backend
 * Gets new access/refresh tokens from backend (which calls Supabase)
 * 
 * @returns New tokens on success
 * @throws AuthError on 400/401/500 - frontend should redirect to login
 */
export async function backendRefresh(
  refreshToken: string
): Promise<RefreshResponse> {
  const url = buildUrl('/auth/refresh/')
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw error as AuthError
  }

  return response.json()
}

/**
 * Logout user from backend
 * Removes refresh token from backend database
 * 
 * @returns Always succeeds (idempotent)
 */
export async function backendLogout(accessToken?: string, refreshToken?: string): Promise<void> {
  const url = buildUrl('/auth/logout/')
  const headers = accessToken ? getAuthHeaders(accessToken) : getJsonHeaders()

  await fetch(url, {
    method: 'POST',
    headers,
    body: refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : '{}',
  })
  
  // Always succeeds - no need to check response
}

/**
 * Check if an error is an auth error that requires re-login
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as AuthError).error === 'string'
  )
}
