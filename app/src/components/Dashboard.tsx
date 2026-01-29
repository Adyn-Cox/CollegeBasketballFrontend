'use client'

import React, { useState } from 'react'
import { 
  Target,
  ChevronRight,
  CalendarOff,
  TrendingUp,
  Plus
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { TeamSelectionModal } from './TeamSelectionModal'
import { TeamLogo } from './TeamLogo'
import { type Game } from '@/lib/api/teams'
import { type Team } from '@/lib/collegeData'
import { DashboardLayout } from './DashboardLayout'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Skeleton } from './ui/Skeleton'

interface DashboardProps {
  user: User
}

const POWER_5 = ['ACC', 'Big 12', 'Big Ten', 'Pac-12', 'SEC']
const GROUP_OF_5 = ['American Athletic', 'Conference USA', 'MAC', 'Mountain West', 'Sun Belt']

export function Dashboard({ user }: DashboardProps) {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [conferenceFilter, setConferenceFilter] = useState<'power5' | 'group5' | 'all' | 'specific'>('power5')
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>('')

  const {
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
  } = useDashboardData()

  // Filter games based on selection
  const filteredGames = React.useMemo(() => {
    if (conferenceFilter === 'all') return todayGames

    return todayGames.filter(game => {
      const homeConf = teamConferenceMap.get(game.home_team.school)
      const awayConf = teamConferenceMap.get(game.away_team.school)

      if (conferenceFilter === 'power5') {
        return (homeConf && POWER_5.includes(homeConf)) || (awayConf && POWER_5.includes(awayConf))
      }
      
      if (conferenceFilter === 'group5') {
        return (homeConf && GROUP_OF_5.includes(homeConf)) || (awayConf && GROUP_OF_5.includes(awayConf))
      }

      if (conferenceFilter === 'specific' && selectedConferenceId) {
        // Find conference name from ID
        const conf = conferences.find(c => c.id.toString() === selectedConferenceId)
        if (!conf) return false
        return homeConf === conf.abbreviation || awayConf === conf.abbreviation
      }

      return false
    })
  }, [todayGames, conferenceFilter, selectedConferenceId, teamConferenceMap, conferences])

  // Helper function to convert hex color to CSS color
  const hexToColor = (hex: string | null | undefined): string => {
    if (!hex || !hex.trim()) return ''
    const cleanHex = hex.replace('#', '').trim()
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16)
      const g = parseInt(cleanHex.substring(2, 4), 16)
      const b = parseInt(cleanHex.substring(4, 6), 16)
      return `rgb(${r}, ${g}, ${b})`
    }
    return `#${cleanHex}`
  }

  // Favorite Teams Section
  const renderFavoriteTeams = () => (
    <div className="mb-10 px-6 md:px-0">
      <div className="flex items-center justify-between mb-4 border-b-2 border-ink pb-2 border-dashed dark:border-cream">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider font-mono dark:text-cream">Your Teams</h2>
        {!isLoading && favoriteTeams.length > 0 && (
          <button 
            onClick={() => setIsTeamModalOpen(true)}
            className="text-xs font-bold text-hoops hover:text-orange-600 flex items-center gap-1 font-mono uppercase transition-colors"
          >
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {favoriteTeams.length === 0 && !isLoading ? (
        <button 
          onClick={() => setIsTeamModalOpen(true)}
          className="w-full group relative overflow-hidden bg-white border-2 border-ink p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-all duration-300 md:h-48 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <div className="w-12 h-12 rounded-none border-2 border-ink flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-hoops group-hover:text-white transition-all duration-300 bg-cream text-ink dark:border-cream dark:bg-black dark:text-cream">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-lg font-display text-ink mb-1 uppercase tracking-wide dark:text-cream">Follow Your Favorites</p>
          <p className="text-xs text-zinc-600 max-w-[200px] font-mono dark:text-cream">Add teams to get personalized predictions and game alerts.</p>
        </button>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
          {isLoading && favoriteTeams.length === 0 ? (
            [1, 2, 3, 4].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-shrink-0 w-32 md:w-full"
              >
                <div className="aspect-square bg-white border-2 border-ink p-4 flex flex-col items-center justify-center mb-2 transition-all duration-300 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
            ))
          ) : (
            favoriteTeams.map((team, index) => {
              const primaryColor = hexToColor(team.primaryColor)
              const secondaryColor = hexToColor(team.secondaryColor)
              
              return (
              <div
                key={team.id || `team-${index}`}
                className="flex-shrink-0 w-32 md:w-full group cursor-pointer"
              >
                <div 
                  className={`aspect-square border-2 p-4 flex flex-col items-center justify-center mb-2 transition-all duration-300 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${
                    !primaryColor ? 'bg-white border-ink dark:bg-black dark:border-cream' : ''
                  }`}
                  style={primaryColor ? {
                    backgroundColor: primaryColor,
                    borderColor: secondaryColor || primaryColor,
                  } : {}}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative mb-3">
                    <div className="w-full h-full rounded-full bg-white/90 border-2 border-black/10 flex items-center justify-center p-2 shadow-sm">
                      <TeamLogo 
                        teamName={team.school || team.name}
                        logoUrl={team.logo}
                        size={64}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <p 
                    className="text-base md:text-lg font-display truncate w-full text-center uppercase font-bold px-2"
                    style={primaryColor ? {
                      color: secondaryColor || '#ffffff',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    } : undefined}
                  >
                    {team.name}
                  </p>
                </div>
                {team.conference && (
                  <p 
                    className="text-[10px] font-bold text-center uppercase tracking-wide font-mono border-t-2 border-transparent group-hover:border-hoops pt-1 transition-colors"
                    style={primaryColor ? { color: primaryColor } : undefined}
                  >
                    {team.conference}
                  </p>
                )}
              </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )

  // Today's Games/Predictions Section
  const renderTodayGames = () => (
    <div className="mb-10 px-6 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b-2 border-ink pb-4 border-dashed dark:border-cream">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 border-2 border-ink animate-pulse" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider font-mono dark:text-cream">Today&apos;s Games</h2>
        </div>

        {/* Conference Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border-2 border-ink p-1 dark:bg-black dark:border-cream">
            <button
              onClick={() => setConferenceFilter('power5')}
              className={`px-3 py-1 text-xs font-bold font-mono uppercase transition-colors ${
                conferenceFilter === 'power5' 
                  ? 'bg-hoops text-white' 
                  : 'text-ink hover:bg-zinc-100 dark:text-cream dark:hover:bg-zinc-900'
              }`}
            >
              Power 5
            </button>
            <button
              onClick={() => setConferenceFilter('group5')}
              className={`px-3 py-1 text-xs font-bold font-mono uppercase transition-colors ${
                conferenceFilter === 'group5' 
                  ? 'bg-hoops text-white' 
                  : 'text-ink hover:bg-zinc-100 dark:text-cream dark:hover:bg-zinc-900'
              }`}
            >
              Group 5
            </button>
            <button
              onClick={() => setConferenceFilter('all')}
              className={`px-3 py-1 text-xs font-bold font-mono uppercase transition-colors ${
                conferenceFilter === 'all' 
                  ? 'bg-hoops text-white' 
                  : 'text-ink hover:bg-zinc-100 dark:text-cream dark:hover:bg-zinc-900'
              }`}
            >
              All
            </button>
          </div>

          <div className="relative">
            <select
              value={conferenceFilter === 'specific' ? selectedConferenceId : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setConferenceFilter('specific')
                  setSelectedConferenceId(e.target.value)
                }
              }}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border-2 border-ink text-xs font-bold font-mono uppercase text-ink focus:outline-none focus:border-hoops cursor-pointer dark:bg-black dark:border-cream dark:text-cream max-w-[150px]"
            >
              <option value="" disabled>Conference...</option>
              {conferences.map(conf => (
                <option key={conf.id} value={conf.id}>{conf.abbreviation}</option>
              ))}
            </select>
            <ChevronRight className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-ink dark:text-cream" />
          </div>
        </div>
      </div>

      {filteredGames.length === 0 && !isLoading ? (
        <div className="bg-white border-2 border-ink p-8 flex flex-col items-center justify-center text-center h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <CalendarOff className="w-10 h-10 text-ink mb-3 opacity-50 dark:text-cream" />
          <p className="text-lg font-display text-ink uppercase dark:text-cream">No Games Found</p>
          <p className="text-xs text-zinc-600 mt-1 font-mono dark:text-cream">
            {todayGames.length > 0 
              ? "Try changing the conference filter." 
              : "Check back tomorrow for more matchups."}
          </p>
          {todayGames.length === 0 && (
            <p className="text-[10px] text-zinc-500 mt-2 font-mono dark:text-zinc-400">
              Teams and games load from the API. If nothing loads, ensure the backend is running (e.g. {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}).
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          {(isLoading ? [1, 2, 3, 4] : filteredGames).map((item, index) => {
            if (typeof item === 'number') {
              // Loading skeleton
              return (
                <div key={`skel-${index}`} className="bg-white border-2 border-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-4" />
                      </div>
                      <Skeleton className="w-8 h-6" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-4" />
                      </div>
                      <Skeleton className="w-8 h-6" />
                    </div>
                    <div className="border-t border-zinc-200 pt-3 flex justify-between dark:border-zinc-800">
                      <Skeleton className="w-20 h-3" />
                      <Skeleton className="w-12 h-3" />
                    </div>
                  </div>
                </div>
              )
            }

            const game = item as Game
            const homeScore = game.home_score
            const awayScore = game.away_score
            const isLive = game.status === 'in_progress'
            const isFinal = game.status === 'final'
            const pickData = userPicks.get(game.id)
            const pickedTeamId = pickData?.teamId
            const isHomePicked = pickedTeamId === game.home_team.id
            const isAwayPicked = pickedTeamId === game.away_team.id
            const homeLogo = teamLogoMap.get(game.home_team.school)
            const awayLogo = teamLogoMap.get(game.away_team.school)

            return (
              <div
                key={game.id}
                className="bg-white border-2 border-ink p-5 relative overflow-hidden group hover:bg-cream transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:bg-zinc-900"
              >
                {/* Game Content */}
                <div className="relative z-10">
                  {/* Home Team */}
                  <div 
                    className={`flex items-center justify-between mb-4 cursor-pointer p-2 -mx-2 rounded transition-colors ${
                      isHomePicked 
                        ? 'bg-hoops/10 border-2 border-hoops dark:bg-hoops/20' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-2 border-transparent'
                    }`}
                    onClick={() => handlePredict(game.id, game.home_team.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream border-2 border-ink flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-none">
                        <TeamLogo teamName={game.home_team.school} logoUrl={homeLogo} size={32} />
                      </div>
                      <span className={`font-display tracking-wide text-lg uppercase truncate max-w-[140px] ${
                        isHomePicked ? 'text-hoops font-bold' : 'text-ink dark:text-cream'
                      }`}>
                        {game.home_team.school}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isHomePicked && (
                        <span className="text-xs font-mono font-bold text-hoops uppercase bg-white dark:bg-black px-2 py-0.5 border border-hoops rounded">
                          PICKED
                        </span>
                      )}
                      <div className={`text-2xl font-display font-bold tracking-tight tabular-nums ${
                        homeScore !== null && awayScore !== null && homeScore > awayScore ? 'text-ink dark:text-cream' : 'text-zinc-500'
                      }`}>
                        {homeScore ?? '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Away Team */}
                  <div 
                    className={`flex items-center justify-between mb-5 cursor-pointer p-2 -mx-2 rounded transition-colors ${
                      isAwayPicked 
                        ? 'bg-hoops/10 border-2 border-hoops dark:bg-hoops/20' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-2 border-transparent'
                    }`}
                    onClick={() => handlePredict(game.id, game.away_team.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream border-2 border-ink flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-none">
                        <TeamLogo teamName={game.away_team.school} logoUrl={awayLogo} size={32} />
                      </div>
                      <span className={`font-display tracking-wide text-lg uppercase truncate max-w-[140px] ${
                        isAwayPicked ? 'text-hoops font-bold' : 'text-ink dark:text-cream'
                      }`}>
                        {game.away_team.school}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAwayPicked && (
                        <span className="text-xs font-mono font-bold text-hoops uppercase bg-white dark:bg-black px-2 py-0.5 border border-hoops rounded">
                          PICKED
                        </span>
                      )}
                      <div className={`text-2xl font-display font-bold tracking-tight tabular-nums ${
                        homeScore !== null && awayScore !== null && awayScore > homeScore ? 'text-ink dark:text-cream' : 'text-zinc-500'
                      }`}>
                        {awayScore ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-ink border-dashed dark:border-cream">
                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">LIVE</span>
                        </>
                      ) : isFinal ? (
                        <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">FINAL</span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                          {game.time || 'TBD'}
                        </span>
                      )}
                    </div>
                    {/* Prediction Placeholder */}
                    <div className="bg-ink text-cream px-2 py-1 text-xs font-mono font-bold border border-ink dark:bg-cream dark:text-ink">
                      PREDICT
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // Prediction Accuracy Widget
  const renderPredictionAccuracy = () => (
    <div className="mb-24 px-6 md:px-0 md:mb-10">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 font-mono dark:text-cream">Performance</h2>
      <div className="bg-white border-2 border-ink p-6 relative overflow-hidden h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        {isLoading && !predictionStats ? (
          <div className="flex flex-col items-center py-4">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-24 h-3" />
          </div>
        ) : !predictionStats || predictionStats.total === 0 ? (
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="w-10 h-10 rounded-lg bg-hoops/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-hoops" />
              </div>
              <h3 className="text-lg font-display text-ink tracking-wide mb-1 dark:text-cream">Track Your Picks</h3>
              <p className="text-xs text-zinc-600 max-w-[160px] leading-relaxed font-sans dark:text-cream">
                Make your first prediction to unlock detailed accuracy stats.
              </p>
              <button className="mt-4 px-4 py-2 bg-hoops text-white text-xs font-display tracking-wider border-2 border-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all dark:border-cream dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                Start Predicting
              </button>
            </div>
            
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-zinc-300 rounded-full dark:border-cream" />
              <div className="absolute inset-0 border-4 border-hoops rounded-full border-t-transparent opacity-30 rotate-45 dark:opacity-50" />
              <div className="text-center">
                <span className="text-2xl font-mono font-bold text-ink dark:text-cream">--</span>
                <span className="block text-[10px] text-zinc-600 uppercase font-bold font-sans dark:text-cream">Accuracy</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                {predictionStats.win_percentage.toFixed(1)}% Win Rate
              </span>
            </div>
            <div className="text-3xl font-display text-ink dark:text-cream mb-1">
              {predictionStats.correct} - {predictionStats.incorrect}
            </div>
            <p className="text-xs text-zinc-500 font-mono uppercase">
              {predictionStats.pending} Pending
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user}>
      <div className="md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-8 space-y-8">
          {renderFavoriteTeams()}
          {renderTodayGames()}
        </div>
        
        <div className="md:col-span-4 space-y-8">
          {renderPredictionAccuracy()}
          
          {/* Upcoming Games Widget (Desktop Only) */}
          <div className="hidden md:block bg-white border-2 border-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-display text-xl text-ink mb-4 uppercase tracking-wide dark:text-cream">Upcoming</h3>
            {upcomingGames.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming games scheduled.</p>
            ) : (
              <div className="space-y-4">
                {upcomingGames.map((game, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 border-2 border-ink hover:bg-white transition-colors cursor-pointer group dark:bg-black dark:border-cream dark:hover:bg-zinc-900">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-mono font-bold text-hoops whitespace-nowrap">
                        {new Date(game.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                      </span>
                      <div className="text-sm font-bold font-mono text-ink uppercase dark:text-cream truncate">
                        {game.home_team.abbreviation} vs {game.away_team.abbreviation}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink group-hover:translate-x-1 transition-transform dark:text-cream flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Selection Modal */}
      <TeamSelectionModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        selectedTeams={favoriteTeams}
        onSelectTeam={handleAddFavorite}
        onDeselectTeam={handleRemoveFavorite}
      />
    </DashboardLayout>
  )
}
