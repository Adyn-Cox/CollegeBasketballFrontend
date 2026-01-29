/**
 * Shared Fetch Utility
 * 
 * Provides fetch with timeout, retry, and consistent error handling.
 */

import { DEFAULT_TIMEOUT, DEFAULT_RETRIES } from './config'

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
}

/** Error thrown when request times out */
export class TimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`)
    this.name = 'TimeoutError'
  }
}

/** Error thrown when all retries are exhausted */
export class RetryError extends Error {
  public readonly lastError: Error
  public readonly attempts: number
  
  constructor(url: string, attempts: number, lastError: Error) {
    super(`Request to ${url} failed after ${attempts} attempts: ${lastError.message}`)
    this.name = 'RetryError'
    this.lastError = lastError
    this.attempts = attempts
  }
}

/** Error thrown when backend returns an error response */
export class ApiError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly body?: unknown
  
  constructor(response: Response, body?: unknown) {
    const message = body && typeof body === 'object' && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : response.statusText
    super(`API Error ${response.status}: ${message}`)
    this.name = 'ApiError'
    this.status = response.status
    this.statusText = response.statusText
    this.body = body
  }
  
  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403
  }
  
  get isNotFound(): boolean {
    return this.status === 404
  }
  
  get isServerError(): boolean {
    return this.status >= 500
  }
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(url, timeout)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Determines if an error is retryable
 */
function isRetryable(error: unknown): boolean {
  // Retry on network errors
  if (error instanceof TypeError) return true
  // Retry on timeout
  if (error instanceof TimeoutError) return true
  // Retry on server errors (5xx)
  if (error instanceof ApiError && error.isServerError) return true
  return false
}

/**
 * Wait for a duration (for retry backoff)
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Enhanced fetch with timeout and retry support.
 * 
 * @example
 * const response = await apiFetch('/users/me', {
 *   headers: getAuthHeaders(token),
 *   timeout: 10000,
 *   retries: 3,
 * })
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    ...fetchOptions
  } = options
  
  let lastError: Error = new Error('No attempts made')
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout)
      
      // Throw on error responses so they can be caught/retried
      if (!response.ok) {
        let body: unknown
        try {
          body = await response.clone().json()
        } catch {
          // Body not JSON, that's fine
        }
        throw new ApiError(response, body)
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry if error is not retryable or this was the last attempt
      if (!isRetryable(error) || attempt === retries + 1) {
        throw lastError
      }
      
      // Exponential backoff: 100ms, 200ms, 400ms, ...
      const delay = 100 * Math.pow(2, attempt - 1)
      await wait(delay)
    }
  }
  
  throw new RetryError(url, retries + 1, lastError)
}

/**
 * Fetch JSON data from an API endpoint.
 * Automatically parses response as JSON.
 * 
 * @example
 * const data = await fetchJson<User[]>('/users', { headers: getAuthHeaders(token) })
 */
export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, options)
  return response.json() as Promise<T>
}
