/**
 * Shared Type Definitions
 * 
 * Central location for all shared types used across the application.
 * Import types from here instead of defining them in multiple places.
 */

// Re-export API types
export type {
  Conference,
  Venue,
  Team as APITeam,
  TeamStats,
  GameTeam,
  Game,
  TeamsResponse,
  GamesResponse,
  TeamsQueryParams,
  GamesQueryParams,
} from '@/lib/api/teams'

export type {
  FavoriteTeam,
  Prediction,
  PredictionStats,
} from '@/lib/api/user'

export type {
  LoginResponse,
  RefreshResponse,
  AuthError,
} from '@/lib/api/auth'

export type {
  MLPrediction,
  MLMatchupPrediction,
  MLModelInfo,
} from '@/lib/api/ml'

// Re-export frontend Team type
export type { Team } from '@/lib/collegeData'

// Re-export error types
export { UnauthorizedError } from '@/lib/api/user'
export { ApiError, TimeoutError, RetryError } from '@/lib/api/fetch'
