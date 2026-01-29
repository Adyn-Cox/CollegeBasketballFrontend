/**
 * User API Client
 * 
 * Handles communication with the backend for user-specific features
 * like favorite teams and matchup predictions.
 */

import { buildUrl, getAuthHeaders } from './config'
import { fetchJson, apiFetch, ApiError } from './fetch'
import { getLogoUrl } from '@/lib/logoApi'
import { Team } from '@/lib/collegeData'

// ============================================================================
// Types
// ============================================================================

export interface FavoriteTeam {
  id: number
  user_id: string
  team_id: number
  created_at: string
  team: {
    id: number
    school: string
    abbreviation: string
    display_name: string
    primary_color: string | null
    secondary_color: string | null
    conference: {
      id: number
      name: string
      abbreviation: string
    } | null
  }
}

export interface Prediction {
  id: number
  user_id: string
  game_id: number
  predicted_winner_id: number
  is_correct: boolean | null
  checked_at: string | null
  created_at: string
  updated_at: string
  game: {
    id: number
    date: string
    home_team: {
      id: number
      school: string
      abbreviation: string
    }
    away_team: {
      id: number
      school: string
      abbreviation: string
    }
    home_score: number | null
    away_score: number | null
    status: string
  }
}

export interface PredictionStats {
  total: number
  correct: number
  incorrect: number
  pending: number
  win_percentage: number
}

// ============================================================================
// Error Classes
// ============================================================================

/** Error thrown when backend returns 401/403 — session may be expired or invalid */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Session expired or invalid. Please sign in again.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Wraps fetch calls to throw UnauthorizedError on 401/403
 */
async function authFetch<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  try {
    return await fetchJson<T>(url, {
      ...options,
      headers: {
        ...getAuthHeaders(token),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      throw new UnauthorizedError(
        error.status === 401
          ? 'Session expired or invalid. Please sign in again.'
          : 'You don\'t have permission to do that.'
      )
    }
    throw error
  }
}

/**
 * Wraps fetch calls that return void to throw UnauthorizedError on 401/403
 */
async function authFetchVoid(url: string, token: string, options: RequestInit = {}): Promise<void> {
  try {
    await apiFetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(token),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      throw new UnauthorizedError(
        error.status === 401
          ? 'Session expired or invalid. Please sign in again.'
          : 'You don\'t have permission to do that.'
      )
    }
    throw error
  }
}

// ============================================================================
// Favorites API
// ============================================================================

/**
 * Get user's favorite teams
 */
export async function getFavorites(token: string): Promise<FavoriteTeam[]> {
  const url = buildUrl('/users/me/favorites')
  return authFetch<FavoriteTeam[]>(url, token)
}

/**
 * Add a favorite team
 */
export async function addFavorite(token: string, teamId: number): Promise<FavoriteTeam> {
  const url = buildUrl('/users/me/favorites')
  try {
    return await authFetch<FavoriteTeam>(url, token, {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId }),
    })
  } catch (error) {
    // Handle "already a favorite" as success (idempotent)
    if (error instanceof ApiError && error.status === 400) {
      const body = error.body as Record<string, unknown> | undefined
      const detail = body?.detail || body?.error || ''
      if (typeof detail === 'string' && /already|duplicate|exists/i.test(detail)) {
        const list = await getFavorites(token)
        const found = list.find((f) => f.team_id === teamId)
        if (found) return found
      }
    }
    throw error
  }
}

/**
 * Remove a favorite team
 */
export async function removeFavorite(token: string, teamId: number): Promise<void> {
  const url = buildUrl(`/users/me/favorites/${teamId}`)
  return authFetchVoid(url, token, { method: 'DELETE' })
}

// ============================================================================
// Predictions API
// ============================================================================

/**
 * Create a prediction
 */
export async function createPrediction(
  token: string,
  gameId: number,
  predictedWinnerId: number
): Promise<Prediction> {
  const url = buildUrl('/predictions')
  return authFetch<Prediction>(url, token, {
    method: 'POST',
    body: JSON.stringify({
      game_id: gameId,
      predicted_winner_id: predictedWinnerId,
    }),
  })
}

/**
 * Get user's predictions
 */
export async function getPredictions(
  token: string,
  params?: { season?: number; status?: 'correct' | 'incorrect' | 'pending'; limit?: number; offset?: number }
): Promise<Prediction[]> {
  const url = buildUrl('/users/me/predictions', {
    season: params?.season,
    status: params?.status,
    limit: params?.limit,
    offset: params?.offset,
  })
  return authFetch<Prediction[]>(url, token)
}

/**
 * Get a single prediction by ID
 */
export async function getPrediction(token: string, predictionId: number): Promise<Prediction> {
  const url = buildUrl(`/predictions/${predictionId}`)
  return authFetch<Prediction>(url, token)
}

/**
 * Update a prediction (partial — change predicted winner only)
 */
export async function updatePrediction(
  token: string,
  predictionId: number,
  predictedWinnerId: number
): Promise<Prediction> {
  const url = buildUrl(`/predictions/${predictionId}`)
  return authFetch<Prediction>(url, token, {
    method: 'PATCH',
    body: JSON.stringify({ predicted_winner_id: predictedWinnerId }),
  })
}

/**
 * Full update of a prediction (game_id and predicted_winner_id)
 */
export async function fullUpdatePrediction(
  token: string,
  predictionId: number,
  gameId: number,
  predictedWinnerId: number
): Promise<Prediction> {
  const url = buildUrl(`/predictions/${predictionId}`)
  return authFetch<Prediction>(url, token, {
    method: 'PUT',
    body: JSON.stringify({
      game_id: gameId,
      predicted_winner_id: predictedWinnerId,
    }),
  })
}

/**
 * Delete a prediction
 */
export async function deletePrediction(token: string, predictionId: number): Promise<void> {
  const url = buildUrl(`/predictions/${predictionId}`)
  return authFetchVoid(url, token, { method: 'DELETE' })
}

/**
 * Get user's prediction statistics
 */
export async function getPredictionStats(token: string): Promise<PredictionStats> {
  const url = buildUrl('/users/me/prediction-stats')
  return authFetch<PredictionStats>(url, token)
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert backend FavoriteTeam to frontend Team interface
 */
export async function convertFavoriteToTeam(fav: FavoriteTeam, dark: boolean = false): Promise<Team> {
  const teamData = fav.team
  const logo = await getLogoUrl(teamData.school, dark)
  
  return {
    id: teamData.abbreviation?.toLowerCase() || teamData.school.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: teamData.display_name || teamData.school,
    conference: teamData.conference?.name,
    logo: logo ?? undefined,
    primaryColor: teamData.primary_color ? `#${teamData.primary_color}` : undefined,
    secondaryColor: teamData.secondary_color ? `#${teamData.secondary_color}` : undefined,
    apiId: teamData.id,
  }
}

// Re-export ApiError for type checking
export { ApiError }
