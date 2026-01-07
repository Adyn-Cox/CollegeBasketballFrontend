/**
 * Backend Authentication API Client
 * 
 * Handles communication with the Django backend for authentication.
 * All endpoints return proper error responses that the frontend handles
 * by redirecting to login on any error.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
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
 * Refresh tokens with backend
 * Gets new access/refresh tokens from backend (which calls Supabase)
 * 
 * @returns New tokens on success
 * @throws AuthError on 400/401/500 - frontend should redirect to login
 */
export async function backendRefresh(
  refreshToken: string
): Promise<RefreshResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  await fetch(`${API_BASE_URL}/api/auth/logout/`, {
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

