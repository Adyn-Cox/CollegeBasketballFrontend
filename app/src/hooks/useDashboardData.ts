'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToken } from '@/lib/auth/getToken'
import { useTheme } from 'next-themes'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  createPrediction,
  deletePrediction,
  getPredictionStats,
  getPredictions,
  convertFavoriteToTeam,
  UnauthorizedError,
  type PredictionStats,
} from '@/lib/api/user'
import {
  getTodayGames,
  getWeekGames,
  getConferences,
  getTeams,
  type Game,
  type Conference,
} from '@/lib/api/teams'
import { type Team, loadTeamsFromCSV } from '@/lib/collegeData'

// ============================================================================
// Types
// ============================================================================

export interface DashboardData {
  isLoading: boolean
  favoriteTeams: Team[]
  todayGames: Game[]
  upcomingGames: Game[]
  conferences: Conference[]
  predictionStats: PredictionStats | null
  userPicks: Map<number, { teamId: number; predictionId: number }>
  teamConferenceMap: Map<string, string>
  teamLogoMap: Map<string, string>
}

export interface DashboardActions {
  setFavoriteTeams: React.Dispatch<React.SetStateAction<Team[]>>
  handlePredict: (gameId: number, teamId: number) => Promise<void>
  handleAddFavorite: (team: Team) => Promise<void>
  handleRemoveFavorite: (teamId: string) => Promise<void>
}

// ============================================================================
// Hook
// ============================================================================

export function useDashboardData(): DashboardData & DashboardActions {
  const router = useRouter()
  const { token } = useToken()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Data state
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([])
  const [todayGames, setTodayGames] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [conferences, setConferences] = useState<Conference[]>([])
  const [predictionStats, setPredictionStats] = useState<PredictionStats | null>(null)
  const [userPicks, setUserPicks] = useState<Map<number, { teamId: number; predictionId: number }>>(new Map())
  const [teamConferenceMap, setTeamConferenceMap] = useState<Map<string, string>>(new Map())
  const [teamLogoMap, setTeamLogoMap] = useState<Map<string, string>>(new Map())

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch public data in parallel
        const [todayResult, weekResult, confResult, teamsResult] = await Promise.allSettled([
          getTodayGames(),
          getWeekGames(),
          getConferences(),
          loadTeamsFromCSV({ dark: isDark }),
        ])

        // Extract results
        const todayData = todayResult.status === 'fulfilled' ? todayResult.value : null
        const weekData = weekResult.status === 'fulfilled' ? weekResult.value : null
        const conferenceList = confResult.status === 'fulfilled' ? confResult.value : []
        const allTeamsData = teamsResult.status === 'fulfilled' ? teamsResult.value : []

        // Parse games
        const todayGamesList = Array.isArray(todayData?.games)
          ? todayData.games
          : Array.isArray(todayData)
          ? todayData
          : []
        const weekGamesList = Array.isArray(weekData?.games)
          ? weekData.games
          : Array.isArray(weekData)
          ? weekData
          : []

        setTodayGames(todayGamesList)
        setUpcomingGames(weekGamesList.slice(0, 5))
        setConferences(Array.isArray(conferenceList) ? conferenceList : [])

        // Build lookup maps
        const confMap = new Map<string, string>()
        const logoMap = new Map<string, string>()
        for (const team of allTeamsData) {
          if (team?.conference) {
            confMap.set(team.name, team.conference)
            if (team.school) confMap.set(team.school, team.conference)
          }
          if (team?.logo) {
            logoMap.set(team.name, team.logo)
            if (team.school) logoMap.set(team.school, team.logo)
          }
        }
        setTeamConferenceMap(confMap)
        setTeamLogoMap(logoMap)

        // Fetch user data if authenticated
        if (token) {
          // Fetch favorites immediately and separately
          getFavorites(token)
            .then(async (favorites) => {
              const teamObjects = await Promise.all(
                (Array.isArray(favorites) ? favorites : []).map((f) => convertFavoriteToTeam(f, isDark))
              )
              setFavoriteTeams(teamObjects)
            })
            .catch((error) => {
              if (error instanceof UnauthorizedError) {
                router.replace('/?error=session_expired')
              } else {
                console.error('Failed to fetch favorites:', error)
              }
            })

          // Fetch other user stats in parallel
          try {
            const [stats, predictions] = await Promise.all([
              getPredictionStats(token),
              getPredictions(token, { limit: 100 }),
            ])

            const picksMap = new Map<number, { teamId: number; predictionId: number }>()
            if (Array.isArray(predictions)) {
              for (const p of predictions) {
                picksMap.set(p.game_id, { teamId: p.predicted_winner_id, predictionId: p.id })
              }
            }

            setPredictionStats(stats ?? null)
            setUserPicks(picksMap)
          } catch (error) {
            console.error('Failed to fetch user stats/predictions:', error)
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, isDark, router])

  // Handle making a prediction
  const handlePredict = useCallback(
    async (gameId: number, teamId: number) => {
      if (!token) return

      const currentPick = userPicks.get(gameId)
      const isRemoving = currentPick?.teamId === teamId

      // Optimistic update
      setUserPicks((prev) => {
        const newMap = new Map(prev)
        if (isRemoving) {
          newMap.delete(gameId)
        } else {
          newMap.set(gameId, { teamId, predictionId: 0 })
        }
        return newMap
      })

      try {
        if (isRemoving && currentPick) {
          await deletePrediction(token, currentPick.predictionId)
        } else {
          const newPrediction = await createPrediction(token, gameId, teamId)
          setUserPicks((prev) => new Map(prev).set(gameId, { teamId, predictionId: newPrediction.id }))
        }

        // Refresh stats
        const stats = await getPredictionStats(token)
        setPredictionStats(stats)
      } catch (error) {
        console.error('Error updating prediction:', error)
        // Revert optimistic update
        setUserPicks((prev) => {
          const newMap = new Map(prev)
          if (isRemoving && currentPick) {
            newMap.set(gameId, currentPick)
          } else {
            newMap.delete(gameId)
          }
          return newMap
        })
      }
    },
    [token, userPicks]
  )

  // Handle adding a favorite
  const handleAddFavorite = useCallback(
    async (team: Team) => {
      if (!token) return

      // Optimistic update
      setFavoriteTeams((prev) => [...prev, team])

      const persistFavorite = async (backendTeamId: number) => {
        try {
          await addFavorite(token, backendTeamId)
        } catch (err) {
          console.error('Error adding favorite:', err)
          // Try lookup by school name
          try {
            const { teams } = await getTeams({ search: team.school || team.name, limit: 10 })
            const match =
              teams.find(
                (t) => t.school === (team.school || team.name) || (team.abbreviation && t.abbreviation === team.abbreviation)
              ) ?? teams[0]
            if (match) {
              await addFavorite(token, match.id)
              setFavoriteTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, apiId: match.id } : t)))
            }
          } catch (e) {
            console.error('Fallback add favorite failed:', e)
            // Revert optimistic update
            setFavoriteTeams((prev) => prev.filter((t) => t.id !== team.id))
          }
        }
      }

      if (team.apiId) {
        await persistFavorite(team.apiId)
      } else {
        try {
          const { teams } = await getTeams({ search: team.school || team.name, limit: 5 })
          const match = teams[0]
          if (match) {
            await persistFavorite(match.id)
          }
        } catch (e) {
          console.error('Lookup team for favorite failed:', e)
        }
      }
    },
    [token]
  )

  // Handle removing a favorite
  const handleRemoveFavorite = useCallback(
    async (teamId: string) => {
      if (!token) return

      const team = favoriteTeams.find((t) => t.id === teamId)
      if (!team?.apiId) return

      // Optimistic update
      setFavoriteTeams((prev) => prev.filter((t) => t.id !== teamId))

      try {
        await removeFavorite(token, team.apiId)
      } catch (err) {
        console.error('Error removing favorite:', err)
        // Revert optimistic update
        setFavoriteTeams((prev) => [...prev, team])
      }
    },
    [token, favoriteTeams]
  )

  return {
    isLoading,
    favoriteTeams,
    todayGames,
    upcomingGames,
    conferences,
    predictionStats,
    userPicks,
    teamConferenceMap,
    teamLogoMap,
    setFavoriteTeams,
    handlePredict,
    handleAddFavorite,
    handleRemoveFavorite,
  }
}
