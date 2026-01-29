/**
 * Teams API Client
 * 
 * Handles communication with the backend for team and game data.
 */

import { buildUrl, getJsonHeaders } from './config'
import { fetchJson, ApiError } from './fetch'

// ============================================================================
// Types
// ============================================================================

export interface Conference {
  id: number
  name: string
  abbreviation: string
}

export interface Venue {
  id: number
  name: string
  city: string
  state: string
  capacity: number | null
}

export interface Team {
  id: number
  source_id: string
  school: string
  mascot: string
  abbreviation: string
  display_name: string
  short_display_name: string
  primary_color: string | null
  secondary_color: string | null
  conference: Conference | null
  venue?: Venue
}

export interface TeamStats {
  id: number
  team_id: number
  season: number
  wins: number
  losses: number
  conference_wins: number
  conference_losses: number
  points_per_game: number
  points_allowed_per_game: number
  field_goal_pct: number
  three_point_pct: number
  free_throw_pct: number
  rebounds_per_game: number
  assists_per_game: number
  steals_per_game: number
  blocks_per_game: number
  turnovers_per_game: number
  record: string
  conference_record: string
  win_pct: number
}

export interface GameTeam {
  id: number
  school: string
  abbreviation: string
  display_name: string
  primary_color: string | null
  secondary_color: string | null
}

export interface Game {
  id: number
  ncaa_game_id: string
  date: string
  time: string | null
  home_team: GameTeam
  away_team: GameTeam
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'cancelled'
  status_detail: string
  season: number
  season_type: string
  venue: Venue | null
}

export interface TeamsResponse {
  total: number
  teams: Team[]
}

export interface GamesResponse {
  total: number
  games: Game[]
}

export interface TeamsQueryParams {
  search?: string
  conference?: string
  limit?: number
  offset?: number
}

export interface GamesQueryParams {
  season?: number
  status?: 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'cancelled'
  limit?: number
  offset?: number
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all teams with optional filters
 */
export async function getTeams(params?: TeamsQueryParams): Promise<TeamsResponse> {
  const url = buildUrl('/teams', {
    search: params?.search,
    conference: params?.conference,
    limit: params?.limit,
    offset: params?.offset,
    predictable: params?.predictable,
  })
  return fetchJson<TeamsResponse>(url, { headers: getJsonHeaders() })
}

/**
 * Get a single team by ID
 */
export async function getTeam(teamId: number): Promise<Team> {
  const url = buildUrl(`/teams/${teamId}`)
  return fetchJson<Team>(url, { headers: getJsonHeaders() })
}

/**
 * Get team games/schedule
 */
export async function getTeamGames(
  teamId: number,
  params?: GamesQueryParams
): Promise<GamesResponse> {
  const url = buildUrl(`/teams/${teamId}/games`, {
    season: params?.season,
    status: params?.status,
    limit: params?.limit,
    offset: params?.offset,
  })
  return fetchJson<GamesResponse>(url, { headers: getJsonHeaders() })
}

/**
 * Get team statistics
 */
export async function getTeamStats(
  teamId: number,
  season?: number
): Promise<TeamStats> {
  const url = buildUrl(`/teams/${teamId}/stats`, { season })
  return fetchJson<TeamStats>(url, { headers: getJsonHeaders() })
}

/**
 * Get today's games
 */
export async function getTodayGames(): Promise<GamesResponse> {
  const url = buildUrl('/games/today')
  return fetchJson<GamesResponse>(url, { headers: getJsonHeaders() })
}

/**
 * Get games for a specific date (YYYY-MM-DD)
 */
export async function getGamesByDate(date: string): Promise<GamesResponse> {
  const url = buildUrl('/games', { date })
  return fetchJson<GamesResponse>(url, { headers: getJsonHeaders() })
}

/**
 * Get games for the week
 */
export async function getWeekGames(startDate?: string): Promise<GamesResponse> {
  const url = buildUrl('/games/week', { start_date: startDate })
  return fetchJson<GamesResponse>(url, { headers: getJsonHeaders() })
}

/**
 * Get a single game by ID
 */
export async function getGame(gameId: number): Promise<Game> {
  const url = buildUrl(`/games/${gameId}`)
  return fetchJson<Game>(url, { headers: getJsonHeaders() })
}

/**
 * Get all conferences
 */
export async function getConferences(): Promise<Conference[]> {
  const url = buildUrl('/conferences')
  return fetchJson<Conference[]>(url, { headers: getJsonHeaders() })
}

// Re-export ApiError for consumers
export { ApiError }
