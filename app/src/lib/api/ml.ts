/**
 * Machine Learning Predictions API Client
 */

import { buildUrl, getJsonHeaders } from './config'
import { fetchJson } from './fetch'

// ============================================================================
// Types
// ============================================================================

export interface MLPrediction {
  id: number
  game_id: number
  home_team_id: number
  home_team_school: string
  away_team_id: number
  away_team_school: string
  game_date: string
  home_win_probability: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_margin: number
  confidence_score: number
  predicted_winner: string
  predicted_winner_id: number
  model_version: string
  predicted_at: string
  home_adj_em: number
  away_adj_em: number
  home_momentum: number
  away_momentum: number
  venue_hca: number
}

/** Response shape for GET /api/ml/matchup/{home_team_id}/{away_team_id} */
export interface MLMatchupPrediction {
  home_team_id: number
  home_team_school: string
  away_team_id: number
  away_team_school: string
  home_win_probability: number  // 0-1
  predicted_home_score: number
  predicted_away_score: number
  predicted_margin: number     // negative = away wins
  confidence_score: number    // 0-1
  predicted_winner: string
  model_version: string
  features?: Record<string, number>
}

export interface MLModelInfo {
  version: string
  is_active: boolean
  training_date: string
  training_games_count: number
  test_accuracy: number
  test_log_loss: number
  feature_count: number
  top_features: string[]
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get ML model prediction for a specific game
 */
export async function getMLGamePrediction(gameId: number): Promise<MLPrediction> {
  const url = buildUrl(`/ml/predictions/${gameId}`)
  return fetchJson<MLPrediction>(url, { headers: getJsonHeaders() })
}

/**
 * Get ML predictions list with filtering
 */
export async function getMLPredictions(params?: {
  date?: string
  team_id?: number
  season?: number
  limit?: number
  offset?: number
}): Promise<MLPrediction[]> {
  const url = buildUrl('/ml/predictions', params)
  return fetchJson<MLPrediction[]>(url, { headers: getJsonHeaders() })
}

/**
 * Get ML prediction for a hypothetical matchup
 */
export async function getMLMatchupPrediction(homeTeamId: number, awayTeamId: number, season?: number): Promise<MLMatchupPrediction> {
  const url = buildUrl(`/ml/matchup/${homeTeamId}/${awayTeamId}`, { season })
  return fetchJson<MLMatchupPrediction>(url, { headers: getJsonHeaders() })
}

/**
 * Get information about the active ML model
 */
export async function getMLModelInfo(): Promise<MLModelInfo> {
  const url = buildUrl('/ml/model/info')
  return fetchJson<MLModelInfo>(url, { headers: getJsonHeaders() })
}
