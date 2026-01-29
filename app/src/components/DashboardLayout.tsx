'use client'

import React from 'react'
import { 
  Home, 
  Trophy, 
  BarChart2, 
  User as UserIcon, 
  LogOut, 
  Settings,
  Bell
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useSupabaseClient } from '@/lib/supabase/client'
import { backendLogout } from '@/lib/api/auth'
import { useRouter, usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { AppLogo } from './AppLogo'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: User
}

export function DashboardLayout({ children, user: propUser }: DashboardLayoutProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(propUser || null)

  React.useEffect(() => {
    if (!user) {
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        if (user) setUser(user)
      })
    }
  }, [supabase, user])

  const handleSignOut = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    await backendLogout(
      session?.access_token,
      session?.refresh_token
    )
    
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Header Component (mobile)
  const renderHeader = () => (
    <div className="flex flex-row justify-between items-center px-6 pt-8 pb-6 bg-cream border-b-2 border-ink sticky top-0 z-20 md:hidden dark:bg-black dark:border-cream">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <AppLogo size={44} className="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-hoops tracking-wider mb-0.5 uppercase font-mono">Welcome Back</p>
          <h1 className="text-2xl font-display text-ink tracking-tight uppercase truncate dark:text-cream">Picks Predictor</h1>
        </div>
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
        <AppLogo size={48} className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" />
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
          { icon: Home, label: 'DASHBOARD', path: '/dashboard' },
          { icon: Trophy, label: 'MY PICKS', path: '/dashboard/picks' },
          { icon: BarChart2, label: 'STATISTICS', path: '/dashboard/stats' },
          { icon: Settings, label: 'SETTINGS', path: '/dashboard/settings' }
        ].map((item, index) => {
          const isActive = pathname === item.path
          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 border-2 transition-all font-mono text-sm font-bold uppercase ${
                isActive 
                  ? 'bg-hoops text-white border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' 
                  : 'bg-transparent border-transparent text-ink hover:border-ink hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] dark:text-cream dark:hover:bg-zinc-900 dark:hover:border-cream dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-6 border-t-2 border-ink border-dashed dark:border-cream">
        <div className="flex items-center justify-between px-2 py-3 mb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center text-sm font-bold text-ink shrink-0 font-mono dark:border-cream dark:bg-black dark:text-cream">
              {getInitials()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-ink truncate font-mono uppercase dark:text-cream">{user?.email || 'Loading...'}</p>
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

  // Bottom Navigation (Mobile Only)
  const renderBottomTabs = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-cream border-t-2 border-ink pb-8 pt-4 px-6 md:hidden z-20 dark:bg-black dark:border-cream">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {[
          { icon: Home, label: 'Home', path: '/dashboard' },
          { icon: Trophy, label: 'Picks', path: '/dashboard/picks' },
          { icon: BarChart2, label: 'Stats', path: '/dashboard/stats' },
          { icon: UserIcon, label: 'Profile', path: '/dashboard/profile' }
        ].map((tab, index) => {
          const isActive = pathname === tab.path
          return (
            <button
              key={index}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-1.5 w-16 group ${
                isActive ? 'text-hoops' : 'text-zinc-600 hover:text-zinc-800 dark:text-cream dark:hover:text-cream'
              }`}
            >
              <tab.icon 
                className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                  isActive ? 'fill-hoops/20' : ''
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-hoops/30 dark:bg-black dark:text-cream">
      {renderSidebar()}
      
      <div className="md:pl-64 min-h-screen relative">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center px-8 py-6 sticky top-0 z-20 bg-cream border-b-2 border-ink dark:bg-black dark:border-cream">
          <div className="flex items-center gap-4">
            <AppLogo size={40} className="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" />
            <h1 className="text-4xl font-display text-ink uppercase tracking-tighter dark:text-cream">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 border-2 border-ink bg-white hover:bg-zinc-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-black dark:border-cream dark:text-cream dark:hover:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <Bell className="w-5 h-5 text-ink dark:text-cream" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-hoops border border-ink dark:border-cream" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto md:p-8 pb-24 md:pb-8">
          {renderHeader()}
          {children}
        </div>
        
        {renderBottomTabs()}
        
        {/* Background Texture - Light Mode Only */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:hidden" />
      </div>
    </div>
  )
}
