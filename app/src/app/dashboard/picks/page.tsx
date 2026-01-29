'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToken } from '@/lib/auth/getToken'
import { getPredictions, deletePrediction, UnauthorizedError, type Prediction } from '@/lib/api/user'
import { loadTeamsFromCSV } from '@/lib/collegeData'
import { TeamLogo } from '@/components/TeamLogo'
import { Trophy, X } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useTheme } from 'next-themes'
import { HeadToHeadSelector } from '@/components/HeadToHeadSelector'

export default function MyPicksPage() {
  const router = useRouter()
  const { token, isLoading: authLoading } = useToken()
  const { theme } = useTheme()
  const [allPicks, setAllPicks] = useState<Prediction[]>([])
  const [teamLogoMap, setTeamLogoMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      if (!authLoading) setLoading(false)
      return
    }

    async function fetchData(tokenValue: string) {
      setLoading(true)
      setError(null)
      try {
        const isDark = theme === 'dark'
        const [teamsData, predictions] = await Promise.all([
          loadTeamsFromCSV({ dark: isDark }),
          getPredictions(tokenValue, { limit: 200 }),
        ])

        const logoMap = new Map<string, string>()
        ;(teamsData || []).forEach((team) => {
          if (team?.logo && team.school) logoMap.set(team.school, team.logo)
          if (team?.logo && team.name) logoMap.set(team.name, team.logo)
        })
        setTeamLogoMap(logoMap)

        if (Array.isArray(predictions)) setAllPicks(predictions)
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          router.replace('/?error=session_expired')
          return
        }
        console.error('Failed to fetch picks page data:', e)
        setError('Failed to load picks. Try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, theme, authLoading])

  const handleRemovePick = async (pred: Prediction) => {
    if (!token) return

    setAllPicks((prev) => prev.filter((p) => p.id !== pred.id))

    try {
      await deletePrediction(token, pred.id)
    } catch (err) {
      console.error('Failed to delete pick:', err)
      setAllPicks((prev) => [...prev, pred])
    }
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-hoops border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!token) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Trophy className="w-12 h-12 text-zinc-300 mb-4" />
          <h2 className="text-xl font-display text-ink uppercase mb-2 dark:text-cream">Login Required</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Please sign in to make predictions.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-hoops" />
          <h1 className="text-3xl font-display text-ink uppercase dark:text-cream">Picks & Predictor</h1>
        </div>
      </div>

      {/* 1. Head-to-Head Predictor (Main Focus) */}
      <div className="mb-12 relative z-10">
         <HeadToHeadSelector />
         <div className="mt-4 text-center text-sm text-zinc-500 font-mono">
            <p>Select any two teams to generate a machine learning prediction for a hypothetical matchup.</p>
            <p className="mt-1">Predictions consider team efficiency, momentum, and venue factors.</p>
          </div>
      </div>

      {/* 2. Your Active Picks */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 font-mono border-b-2 border-ink pb-2 border-dashed dark:text-cream dark:border-cream">
          Your Active Picks ({allPicks.length})
        </h2>
        
        {allPicks.length === 0 ? (
          <div className="p-8 border-2 border-ink border-dashed text-center text-zinc-500 dark:border-zinc-700">
            No active picks.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPicks
              .sort((a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime())
              .map(pick => {
              const isHome = pick.predicted_winner_id === pick.game.home_team.id
              const pickedTeam = isHome ? pick.game.home_team : pick.game.away_team
              const oppTeam = isHome ? pick.game.away_team : pick.game.home_team
              const pickedLogo = teamLogoMap.get(pickedTeam.school) || teamLogoMap.get(pickedTeam.abbreviation)
              
              return (
                <div key={pick.id} className="bg-white border-2 border-ink p-4 relative group shadow-sm dark:bg-black dark:border-cream">
                  <button 
                    onClick={() => handleRemovePick(pick)}
                    className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove pick"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="text-xs font-mono font-bold text-zinc-400 mb-2 uppercase">
                    {new Date(pick.game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <TeamLogo teamName={pickedTeam.school} logoUrl={pickedLogo} size={32} />
                      <div className="truncate">
                        <div className="font-bold text-ink uppercase leading-none dark:text-cream">{pickedTeam.abbreviation}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Defeating {oppTeam.abbreviation}</div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 text-xs font-bold uppercase border rounded ${
                      pick.is_correct === true ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      pick.is_correct === false ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}>
                      {pick.is_correct === true ? 'Won' : pick.is_correct === false ? 'Lost' : 'Pending'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {error && (
        <div className="p-4 text-center text-red-500 border-2 border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded mb-6">
          {error}
        </div>
      )}
    </DashboardLayout>
  )
}
