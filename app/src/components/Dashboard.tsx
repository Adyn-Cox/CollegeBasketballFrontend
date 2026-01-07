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

// Enhanced Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-zinc-800/50 animate-pulse rounded-lg ${className}`} />
)

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteTeams, setFavoriteTeams] = useState<any[]>([])
  const [todayPredictions, setTodayPredictions] = useState<any[]>([])
  const [predictionAccuracy, setPredictionAccuracy] = useState(0)
  const supabase = useSupabaseClient()

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500) // Slightly longer to show off the skeleton

    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
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
    <div className="flex flex-row justify-between items-center px-6 pt-8 pb-6 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5 md:hidden">
      <div className="flex-1">
        <p className="text-xs font-bold text-orange-500 tracking-wider mb-1 uppercase">Welcome Back</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-zinc-950" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-zinc-900">
          <span className="text-sm font-bold text-white">{getInitials()}</span>
        </div>
      </div>
    </div>
  )

  // Desktop Sidebar
  const renderSidebar = () => (
    <div className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-zinc-950 border-r border-white/5 p-6 z-30">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg shadow-orange-500/20 border border-zinc-800">
          <img 
            src="https://images.pexels.com/photos/220383/pexels-photo-220383.jpeg?auto=compress&cs=tinysrgb&w=600" 
            alt="Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Hoops Predictor</h1>
      </div>

      <div className="space-y-2 flex-1">
        {[
          { icon: Home, label: 'Dashboard', active: true },
          { icon: Trophy, label: 'My Picks', active: false },
          { icon: BarChart2, label: 'Statistics', active: false },
          { icon: Settings, label: 'Settings', active: false }
        ].map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
              item.active 
                ? 'bg-orange-500/10 text-orange-500 font-medium' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
            {getInitials()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
            <p className="text-xs text-zinc-500">Free Plan</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm"
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Your Teams</h2>
        {!isLoading && favoriteTeams.length > 0 && (
          <button className="text-xs font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1">
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {favoriteTeams.length === 0 && !isLoading ? (
        <button className="w-full group relative overflow-hidden bg-zinc-900/50 border border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-900 hover:border-orange-500/50 transition-all duration-300 md:h-48">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-orange-500/10 transition-all duration-300">
            <Plus className="w-6 h-6 text-zinc-400 group-hover:text-orange-500" />
          </div>
          <p className="text-sm font-medium text-white mb-1">Follow Your Favorites</p>
          <p className="text-xs text-zinc-500 max-w-[200px]">Add teams to get personalized predictions and game alerts.</p>
        </button>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
          {(isLoading ? [1, 2, 3, 4] : favoriteTeams).map((item, index) => (
            <div
              key={`team-${index}`}
              className="flex-shrink-0 w-32 md:w-full group cursor-pointer"
            >
              <div className="aspect-square bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex flex-col items-center justify-center mb-2 group-hover:border-orange-500/30 group-hover:shadow-lg group-hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden">
                {isLoading ? (
                  <>
                    <Skeleton className="w-12 h-12 rounded-full mb-3" />
                    <Skeleton className="w-20 h-3" />
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-2xl shadow-inner">
                      🏀
                    </div>
                    <p className="text-sm font-semibold text-white truncate w-full text-center">Duke</p>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </div>
              {!isLoading && (
                <p className="text-[10px] font-medium text-zinc-500 text-center uppercase tracking-wide">
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
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Live Predictions</h2>
      </div>

      {todayPredictions.length === 0 && !isLoading ? (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full">
          <CalendarOff className="w-10 h-10 text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-white">No Key Games Today</p>
          <p className="text-xs text-zinc-500 mt-1">Check back later for upcoming matchups.</p>
        </div>
      ) : (
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {(isLoading ? [1, 2, 3] : todayPredictions).map((item, index) => (
            <div
              key={`pred-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-all"
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
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">🦁</div>
                        <span className="font-semibold text-white">Kansas</span>
                      </div>
                      <div className="text-xl font-bold text-white tracking-widest tabular-nums">
                        78
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">🐻</div>
                        <span className="font-semibold text-zinc-400">Baylor</span>
                      </div>
                      <div className="text-xl font-bold text-zinc-500 tracking-widest tabular-nums opacity-50">
                        72
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-400">High Confidence</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">82% Win Prob</span>
                    </div>
                  </div>
                  
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
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
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Performance</h2>
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden h-full">
        {isLoading ? (
          <div className="flex flex-col items-center py-4">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="w-32 h-4 mb-2" />
            <Skeleton className="w-24 h-3" />
          </div>
        ) : predictionAccuracy === 0 ? (
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Track Your Picks</h3>
              <p className="text-xs text-zinc-400 max-w-[160px] leading-relaxed">
                Make your first prediction to unlock detailed accuracy stats.
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                Start Predicting
              </button>
            </div>
            
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent opacity-20 rotate-45" />
              <div className="text-center">
                <span className="text-2xl font-bold text-white">--</span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold">Accuracy</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">Top 10% this week</span>
            </div>
            {/* Real stats would go here */}
          </div>
        )}
      </div>
    </div>
  )

  // Bottom Navigation (Mobile Only)
  const renderBottomTabs = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-lg border-t border-white/5 pb-8 pt-4 px-6 md:hidden z-20">
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
              tab.active ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon 
              className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                tab.active ? 'fill-orange-500/20' : ''
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
      {renderSidebar()}
      
      <div className="md:pl-64 min-h-screen relative">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center px-8 py-6 sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-zinc-950" />
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
              <div className="hidden md:block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Trending Matchups</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-500">#{i + 1}</span>
                        <div className="text-sm font-medium text-white">Duke vs UNC</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {renderBottomTabs()}
        </div>
        
        {/* Ambient Background Gradient */}
        <div className="fixed top-0 left-0 right-0 h-96 bg-orange-500/5 blur-[100px] pointer-events-none" />
      </div>
    </div>
  )
}
