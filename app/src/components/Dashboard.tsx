'use client'

import React, { useState, useEffect } from 'react'
import { 
  Home, 
  Trophy, 
  BarChart2, 
  User as UserIcon, 
  Plus, 
  CalendarOff, 
  TrendingUp, 
  Target,
  ChevronRight,
  Bell,
  LogOut,
  Settings
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSupabaseClient } from '@/lib/supabase/client'
import { backendLogout } from '@/lib/api/auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-zinc-200 animate-pulse rounded-lg dark:bg-zinc-700 ${className}`} />
)

interface DashboardProps {
  user: User
}

interface Team {
  id: string
  name: string
  logo?: string
}

interface Prediction {
  id: string
  homeTeam: string
  awayTeam: string
  predictedScore?: string
}

export function Dashboard({ user }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteTeams] = useState<Team[]>([])
  const [todayPredictions] = useState<Prediction[]>([])
  const [predictionAccuracy] = useState(0)
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500) // Slightly longer to show off the skeleton

    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    if (!supabase) return
    
    // Get current session for tokens
    const { data: { session } } = await supabase.auth.getSession()
    
    // Logout from backend first
    await backendLogout(
      session?.access_token,
      session?.refresh_token
    )
    
    // Then logout from Supabase
    await supabase.auth.signOut()
    
    // Redirect to login
    router.push('/')
  }

  // Get user initials
  const getInitials = () => {
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Header Component
  const renderHeader = () => (
    <div className="flex flex-row justify-between items-center px-6 pt-8 pb-6 bg-cream border-b-2 border-ink sticky top-0 z-20 md:hidden dark:bg-black dark:border-cream">
      <div className="flex-1">
        <p className="text-xs font-bold text-hoops tracking-wider mb-1 uppercase font-mono">Welcome Back</p>
        <h1 className="text-3xl font-display text-ink tracking-tight uppercase dark:text-cream">My Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative p-2 border-2 border-ink bg-white hover:bg-zinc-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          <Bell className="w-5 h-5 text-ink dark:text-cream" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-hoops border border-ink dark:border-cream" />
        </button>
        <div className="w-10 h-10 border-2 border-ink bg-hoops flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-display text-white dark:border-cream dark:shadow-none">
          <span className="text-lg">{getInitials()}</span>
        </div>
      </div>
    </div>
  )

  // Desktop Sidebar
  const renderSidebar = () => (
    <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-cream border-r-2 border-ink p-6 z-30 dark:bg-black dark:border-cream">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-12 h-12 border-2 border-ink bg-white p-1 relative group transition-transform hover:scale-105 duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:border-cream dark:bg-black">
          <Image 
            src="/picks-predictor-light.svg" 
            alt="Logo" 
            fill
            className="object-contain dark:hidden"
          />
          <Image 
            src="/picks-predictor-dark.svg" 
            alt="Logo" 
            fill
            className="object-contain hidden dark:block"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-display text-ink tracking-tight uppercase leading-none dark:text-cream">
            Picks
          </h1>
          <span className="text-sm font-bold font-mono text-hoops tracking-widest uppercase leading-none">
            Predictor
          </span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {[
          { icon: Home, label: 'DASHBOARD', active: true },
          { icon: Trophy, label: 'MY PICKS', active: false },
          { icon: BarChart2, label: 'STATISTICS', active: false },
          { icon: Settings, label: 'SETTINGS', active: false }
        ].map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full px-4 py-3 border-2 transition-all font-mono text-sm font-bold uppercase ${
              item.active 
                ? 'bg-hoops text-white border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' 
                : 'bg-transparent border-transparent text-ink hover:border-ink hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] dark:text-cream dark:hover:bg-zinc-900 dark:hover:border-cream dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={2.5} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t-2 border-ink border-dashed dark:border-cream">
        <div className="flex items-center justify-between px-2 py-3 mb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center text-sm font-bold text-ink shrink-0 font-mono dark:border-cream dark:bg-black dark:text-cream">
              {getInitials()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-ink truncate font-mono uppercase dark:text-cream">{user.email}</p>
              <p className="text-xs text-zinc-600 font-serif italic dark:text-zinc-400">Free Plan</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <button 
          onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-ink border-2 border-transparent hover:border-ink hover:bg-red-50 hover:text-red-600 transition-all font-mono text-sm font-bold uppercase dark:text-cream dark:hover:bg-red-900/30 dark:hover:border-cream dark:hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  // Favorite Teams Section
  const renderFavoriteTeams = () => (
    <div className="mb-10 px-6 md:px-0">
      <div className="flex items-center justify-between mb-4 border-b-2 border-ink pb-2 border-dashed dark:border-cream">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider font-mono dark:text-cream">Your Teams</h2>
        {!isLoading && favoriteTeams.length > 0 && (
          <button className="text-xs font-bold text-hoops hover:text-orange-600 flex items-center gap-1 font-mono uppercase">
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {favoriteTeams.length === 0 && !isLoading ? (
        <button className="w-full group relative overflow-hidden bg-white border-2 border-ink p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-all duration-300 md:h-48 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <div className="w-12 h-12 rounded-none border-2 border-ink flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-hoops group-hover:text-white transition-all duration-300 bg-cream text-ink dark:border-cream dark:bg-black dark:text-cream">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-lg font-display text-ink mb-1 uppercase tracking-wide dark:text-cream">Follow Your Favorites</p>
          <p className="text-xs text-zinc-600 max-w-[200px] font-mono dark:text-cream">Add teams to get personalized predictions and game alerts.</p>
        </button>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
          {(isLoading ? [1, 2, 3, 4] : favoriteTeams).map((item, index) => (
            <div
              key={`team-${index}`}
              className="flex-shrink-0 w-32 md:w-full group cursor-pointer"
            >
              <div className="aspect-square bg-white border-2 border-ink p-4 flex flex-col items-center justify-center mb-2 transition-all duration-300 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                {isLoading ? (
                  <>
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="w-20 h-3" />
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-cream border-2 border-ink flex items-center justify-center mb-3 text-2xl">
                      🏀
                    </div>
                    <p className="text-lg font-display text-ink truncate w-full text-center uppercase dark:text-cream">Duke</p>
                  </>
                )}
              </div>
              {!isLoading && (
                <p className="text-[10px] font-bold text-zinc-600 text-center uppercase tracking-wide font-mono border-t-2 border-transparent group-hover:border-hoops pt-1 transition-colors dark:text-cream">
                  vs UNC • 7 PM
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Today's Predictions Section
  const renderTodayPredictions = () => (
    <div className="mb-10 px-6 md:px-0">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-ink pb-2 border-dashed dark:border-cream">
        <div className="w-3 h-3 bg-red-600 border-2 border-ink animate-pulse" />
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider font-mono dark:text-cream">Live Predictions</h2>
      </div>

      {todayPredictions.length === 0 && !isLoading ? (
        <div className="bg-white border-2 border-ink p-8 flex flex-col items-center justify-center text-center h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <CalendarOff className="w-10 h-10 text-ink mb-3 opacity-50 dark:text-cream" />
          <p className="text-lg font-display text-ink uppercase dark:text-cream">No Key Games Today</p>
          <p className="text-xs text-zinc-600 mt-1 font-mono dark:text-cream">Check back later for upcoming matchups.</p>
        </div>
      ) : (
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          {(isLoading ? [1, 2, 3] : todayPredictions).map((item, index) => (
            <div
              key={`pred-${index}`}
              className="bg-white border-2 border-ink p-5 relative overflow-hidden group hover:bg-cream transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:bg-zinc-900"
            >
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Game Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream border-2 border-ink flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-none">🦁</div>
                        <span className="font-display text-ink tracking-wide text-xl uppercase dark:text-cream">Kansas</span>
                      </div>
                      <div className="text-3xl font-display font-bold text-ink tracking-tight tabular-nums dark:text-cream">
                        78
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream border-2 border-ink flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-none">🐻</div>
                        <span className="font-display text-zinc-600 tracking-wide text-xl uppercase dark:text-cream">Baylor</span>
                      </div>
                      <div className="text-3xl font-display font-bold text-zinc-500 tracking-tight tabular-nums dark:text-cream">
                        72
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-ink border-dashed dark:border-cream">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 border border-ink dark:border-cream" />
                        <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider dark:text-emerald-400">High Confidence</span>
                      </div>
                      <div className="bg-ink text-cream px-2 py-1 text-xs font-mono font-bold border border-ink dark:bg-cream dark:text-ink">
                        82% WIN PROB
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Prediction Accuracy Widget
  const renderPredictionAccuracy = () => (
    <div className="mb-24 px-6 md:px-0 md:mb-10">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 font-mono dark:text-cream">Performance</h2>
      <div className="bg-white border-2 border-ink p-6 relative overflow-hidden h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        {isLoading ? (
          <div className="flex flex-col items-center py-4">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-24 h-3" />
          </div>
        ) : predictionAccuracy === 0 ? (
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
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-mono uppercase">Top 10% this week</span>
            </div>
            {/* Real stats would go here */}
          </div>
        )}
      </div>
    </div>
  )

  // Bottom Navigation (Mobile Only)
  const renderBottomTabs = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-cream border-t-2 border-ink pb-8 pt-4 px-6 md:hidden z-20 dark:bg-black dark:border-cream">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {[
          { icon: Home, label: 'Home', active: true },
          { icon: Trophy, label: 'Picks', active: false },
          { icon: BarChart2, label: 'Stats', active: false },
          { icon: UserIcon, label: 'Profile', active: false }
        ].map((tab, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-1.5 w-16 group ${
              tab.active ? 'text-hoops' : 'text-zinc-600 hover:text-zinc-800 dark:text-cream dark:hover:text-cream'
            }`}
          >
            <tab.icon 
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                tab.active ? 'fill-hoops/20' : ''
              }`} 
              strokeWidth={tab.active ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-hoops/30 dark:bg-black dark:text-cream">
      {renderSidebar()}
      
      <div className="md:pl-64 min-h-screen relative">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center px-8 py-6 sticky top-0 z-20 bg-cream border-b-2 border-ink dark:bg-black dark:border-cream">
          <h1 className="text-4xl font-display text-ink uppercase tracking-tighter dark:text-cream">Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 border-2 border-ink bg-white hover:bg-zinc-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-black dark:border-cream dark:text-cream dark:hover:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Bell className="w-5 h-5 text-ink dark:text-cream" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-hoops border border-ink dark:border-cream" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto md:p-8">
          {renderHeader()}
          
          <div className="md:grid md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8 space-y-8">
              {renderFavoriteTeams()}
              {renderTodayPredictions()}
            </div>
            
            <div className="md:col-span-4 space-y-8">
              {renderPredictionAccuracy()}
              
              {/* Desktop Only Extra Widget */}
              <div className="hidden md:block bg-white border-2 border-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <h3 className="font-display text-xl text-ink mb-4 uppercase tracking-wide dark:text-cream">Trending Matchups</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 border-2 border-ink hover:bg-white transition-colors cursor-pointer group dark:bg-black dark:border-cream dark:hover:bg-zinc-900">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-hoops">#{i + 1}</span>
                        <div className="text-sm font-bold font-mono text-ink uppercase dark:text-cream">Duke vs UNC</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink group-hover:translate-x-1 transition-transform dark:text-cream" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {renderBottomTabs()}
        </div>
        
        {/* Background Texture - Light Mode Only */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:hidden" />
      </div>
    </div>
  )
}
