'use client'

import { useState, useEffect } from 'react'
import { Team } from '@/lib/collegeData'
import { getMLMatchupPrediction, type MLMatchupPrediction } from '@/lib/api/ml'
import { getTeamStats, type TeamStats } from '@/lib/api/teams'
import { TeamSearch } from './TeamSearch'
import { TeamLogo } from './TeamLogo'
import { Trophy, AlertCircle, BarChart2 } from 'lucide-react'
import { Skeleton } from './ui/Skeleton'
import { ApiError } from '@/lib/api/fetch'

export function HeadToHeadSelector() {
  const [team1, setTeam1] = useState<Team | null>(null)
  const [team2, setTeam2] = useState<Team | null>(null)
  const [stats1, setStats1] = useState<TeamStats | null>(null)
  const [stats2, setStats2] = useState<TeamStats | null>(null)
  const [prediction, setPrediction] = useState<MLMatchupPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch stats when team 1 changes (404 = no stats in backend for this team)
  useEffect(() => {
    if (team1?.apiId) {
      getTeamStats(team1.apiId)
        .then(setStats1)
        .catch((err) => {
          if (err instanceof ApiError && err.status === 404) {
            setStats1(null)
            return
          }
          console.error('Failed to load stats 1', err)
          setStats1(null)
        })
    } else {
      setStats1(null)
    }
  }, [team1])

  // Fetch stats when team 2 changes (404 = no stats in backend for this team)
  useEffect(() => {
    if (team2?.apiId) {
      getTeamStats(team2.apiId)
        .then(setStats2)
        .catch((err) => {
          if (err instanceof ApiError && err.status === 404) {
            setStats2(null)
            return
          }
          console.error('Failed to load stats 2', err)
          setStats2(null)
        })
    } else {
      setStats2(null)
    }
  }, [team2])

  // Fetch prediction when both teams selected
  useEffect(() => {
    async function fetchPrediction() {
      if (!team1 || !team2 || !team1.apiId || !team2.apiId) {
        setPrediction(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // API format: home_id first, away_id second (per BASKETBALL_API.md)
        const data = await getMLMatchupPrediction(team1.apiId, team2.apiId)
        setPrediction(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch prediction:', err)
        setPrediction(null)
        if (err instanceof ApiError) {
          if (err.status === 400) {
            setError('Prediction unavailable: Invalid team combination or missing data.')
          } else if (err.status === 404) {
            setError('Prediction unavailable: Missing data for one or both teams.')
          } else if (err.status === 500) {
            setError('Prediction unavailable: Insufficient data for this matchup.')
          } else {
            setError('Failed to generate prediction. Please try again.')
          }
        } else {
          setError('Failed to generate prediction. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [team1, team2])

  /** Format percentage: backend may send 0-1 (0.534) or 0-100 (53.4). */
  const formatPct = (value: number): string => {
    const pct = value > 1 ? value : value * 100
    return `${Number(pct).toFixed(1)}%`
  }

  const renderStatComparison = (label: string, val1: number | string | undefined, val2: number | string | undefined, higherIsBetter = true) => {
    if (val1 === undefined || val2 === undefined) return null
    
    // Parse if string (like "21-5")
    const v1 = val1
    const v2 = val2
    const display1 = val1
    const display2 = val2

    // Simple numeric comparison highlighting
    const num1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1))
    const num2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2))
    
    let highlight1 = false
    let highlight2 = false

    if (!isNaN(num1) && !isNaN(num2)) {
      if (num1 > num2) highlight1 = higherIsBetter
      else if (num2 > num1) highlight2 = higherIsBetter
      else if (num1 < num2) highlight1 = !higherIsBetter
      else if (num2 < num1) highlight2 = !higherIsBetter
    }

    return (
      <div className="grid grid-cols-3 items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <div className={`text-right font-mono ${highlight1 ? 'font-bold text-hoops' : 'text-zinc-600 dark:text-zinc-400'}`}>
          {display1}
        </div>
        <div className="text-center text-xs uppercase font-bold text-zinc-400 px-2">{label}</div>
        <div className={`text-left font-mono ${highlight2 ? 'font-bold text-hoops' : 'text-zinc-600 dark:text-zinc-400'}`}>
          {display2}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-6 h-6 text-hoops" />
        <h2 className="text-xl font-display uppercase tracking-wide text-ink dark:text-cream">
          Head-to-Head Predictor
        </h2>
      </div>

      <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-start mb-8">
        {/* Team 1 Selector */}
        <div className="space-y-4">
          <label className="text-xs font-mono font-bold uppercase text-zinc-500">Home / Team 1</label>
          {team1 ? (
            <div className="relative group">
              <div className="bg-zinc-50 border-2 border-ink p-4 flex items-center gap-3 dark:bg-zinc-900 dark:border-cream">
                <TeamLogo teamName={team1.school || team1.name} logoUrl={team1.logo} size={40} />
                <div>
                  <div className="font-bold text-lg leading-none mb-1">{team1.name}</div>
                  <div className="text-xs font-mono text-zinc-500">{team1.conference}</div>
                </div>
              </div>
              <button
                onClick={() => setTeam1(null)}
                className="absolute -top-2 -right-2 bg-ink text-cream w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors border border-cream dark:bg-cream dark:text-ink dark:border-ink"
              >
                &times;
              </button>
            </div>
          ) : (
            <TeamSearch
              onSelect={setTeam1}
              excludeTeamId={team2?.id}
              placeholder="Select home team..."
              className="w-full"
              predictableOnly
            />
          )}
        </div>

        <div className="hidden md:flex items-center justify-center h-full pt-6">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 font-mono">
            VS
          </div>
        </div>

        {/* Team 2 Selector */}
        <div className="space-y-4">
          <label className="text-xs font-mono font-bold uppercase text-zinc-500">Away / Team 2</label>
          {team2 ? (
            <div className="relative group">
              <div className="bg-zinc-50 border-2 border-ink p-4 flex items-center gap-3 dark:bg-zinc-900 dark:border-cream">
                <TeamLogo teamName={team2.school || team2.name} logoUrl={team2.logo} size={40} />
                <div>
                  <div className="font-bold text-lg leading-none mb-1">{team2.name}</div>
                  <div className="text-xs font-mono text-zinc-500">{team2.conference}</div>
                </div>
              </div>
              <button
                onClick={() => setTeam2(null)}
                className="absolute -top-2 -right-2 bg-ink text-cream w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors border border-cream dark:bg-cream dark:text-ink dark:border-ink"
              >
                &times;
              </button>
            </div>
          ) : (
            <TeamSearch
              onSelect={setTeam2}
              excludeTeamId={team1?.id}
              placeholder="Select away team..."
              className="w-full"
              predictableOnly
            />
          )}
        </div>
      </div>

      {/* Stats Comparison — show when both teams selected; handle 404 (no stats in backend) */}
      {team1 && team2 && (
        <div className="mb-8 border-2 border-zinc-100 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="text-center text-xs font-bold uppercase text-zinc-500 mb-4 tracking-widest">Season Stats Comparison</h3>
          {stats1 && stats2 ? (
            <>
              {renderStatComparison('Record', stats1.record, stats2.record)}
              {renderStatComparison('Conf Record', stats1.conference_record, stats2.conference_record)}
              {renderStatComparison('PPG', stats1.points_per_game, stats2.points_per_game)}
              {renderStatComparison('Opp PPG', stats1.points_allowed_per_game, stats2.points_allowed_per_game, false)}
              {renderStatComparison('FG%', formatPct(stats1.field_goal_pct), formatPct(stats2.field_goal_pct))}
              {/* 3P% hidden: not available from API (KenPom); TO% from Four Factors could be added when exposed */}
            </>
          ) : (
            <p className="text-center text-sm text-zinc-500 py-2">
              Stats unavailable for one or both teams. Prediction may still be available below.
            </p>
          )}
        </div>
      )}

      {/* Prediction Result */}
      <div className="min-h-[200px] flex items-center justify-center border-t-2 border-dashed border-zinc-200 pt-8 mt-4 dark:border-zinc-800">
        {!team1 || !team2 ? (
          <div className="text-center text-zinc-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-mono text-sm uppercase">Select two teams to see prediction</p>
          </div>
        ) : loading ? (
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-20 h-8" />
              <Skeleton className="w-16 h-6" />
              <Skeleton className="w-20 h-8" />
            </div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-24" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : prediction ? (
          <div className="w-full">
            <div className="flex flex-col items-center mb-8">
              <div className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">Projected Winner</div>
              <div className="flex items-center gap-4">
                {(() => {
                  const isHome = [team1.name, team1.school].filter(Boolean).some(n => prediction.predicted_winner === n)
                  const winnerTeam = isHome ? team1 : team2
                  return (
                    <>
                      <TeamLogo
                        teamName={winnerTeam.school || winnerTeam.name}
                        logoUrl={winnerTeam.logo}
                        size={64}
                      />
                      <div className="text-center">
                        <div className="text-4xl font-display text-hoops uppercase">
                          {prediction.predicted_winner}
                        </div>
                        <div className="text-sm font-bold text-zinc-500 font-mono mt-1">
                          {((prediction.home_win_probability > 0.5
                            ? prediction.home_win_probability
                            : 1 - prediction.home_win_probability) * 100).toFixed(1)}% Win Probability
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-200 border-2 border-ink dark:bg-zinc-800 dark:border-cream">
              <div className="bg-white p-4 text-center dark:bg-black">
                <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Projected Score</div>
                <div className="text-3xl font-display text-ink dark:text-cream">
                  {Math.round(prediction.predicted_home_score)}
                </div>
                <div className="text-xs font-bold text-zinc-400 truncate mt-1">{team1.name}</div>
              </div>
              <div className="bg-white p-4 text-center dark:bg-black">
                <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Projected Score</div>
                <div className="text-3xl font-display text-ink dark:text-cream">
                  {Math.round(prediction.predicted_away_score)}
                </div>
                <div className="text-xs font-bold text-zinc-400 truncate mt-1">{team2.name}</div>
              </div>
              <div className="bg-white p-4 text-center dark:bg-black">
                <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Spread</div>
                <div className="text-xl font-bold text-ink dark:text-cream">
                  {prediction.predicted_margin > 0 ? `+${prediction.predicted_margin.toFixed(1)}` : prediction.predicted_margin.toFixed(1)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Margin</div>
              </div>
              <div className="bg-white p-4 text-center dark:bg-black">
                <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Confidence</div>
                <div className="text-xl font-bold text-emerald-600">
                  {Math.round(prediction.confidence_score * 100)}%
                </div>
                <div className="text-xs text-zinc-400 mt-1">Model Confidence</div>
              </div>
            </div>

            <div className="mt-6 text-center">
               <span className="text-[10px] font-mono text-zinc-400 uppercase">
                 Model Version: {prediction.model_version}
               </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
