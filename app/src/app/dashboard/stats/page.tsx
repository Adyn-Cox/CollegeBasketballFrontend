'use client'

import React, { useEffect, useState } from 'react'
import { useToken } from '@/lib/auth/getToken'
import { getPredictionStats, type PredictionStats } from '@/lib/api/user'
import { BarChart2, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function StatsPage() {
  const { token, isLoading: authLoading } = useToken()
  const [stats, setStats] = useState<PredictionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchData(tokenValue: string) {
      try {
        const data = await getPredictionStats(tokenValue)
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData(token)
  }, [token])

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-hoops border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!token) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">Please log in to view stats.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 className="w-8 h-8 text-hoops" />
        <h1 className="text-3xl font-display text-ink uppercase dark:text-cream">Statistics</h1>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading stats...</div>
      ) : !stats ? (
        <div className="p-8 text-center">No stats available.</div>
      ) : (
        <>
          {(() => {
            const correct = Number(stats.correct) || 0
            const incorrect = Number(stats.incorrect) || 0
            const pending = Number(stats.pending) || 0
            const total = Number(stats.total) || 0
            const winPercentage = Number(stats.win_percentage) || 0
            return (
              <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
              label="Win Rate" 
              value={`${winPercentage.toFixed(1)}%`}
              icon={TrendingUp}
              color="text-emerald-600"
            />
            <StatCard 
              label="Correct" 
              value={String(correct)}
              icon={CheckCircle}
              color="text-emerald-600"
            />
            <StatCard 
              label="Incorrect" 
              value={String(incorrect)}
              icon={XCircle}
              color="text-red-600"
            />
            <StatCard 
              label="Pending" 
              value={String(pending)}
              icon={AlertCircle}
              color="text-amber-500"
            />
          </div>

          <div className="bg-white border-2 border-ink p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-xl font-display mb-4 dark:text-cream">Performance Overview</h2>
            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden flex border border-ink dark:border-cream">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (correct / total) * 100 : 0}%` }}
              />
              <div 
                className="bg-red-500 h-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (incorrect / total) * 100 : 0}%` }}
              />
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-mono uppercase text-zinc-500">
              <span>Correct</span>
              <span>Incorrect</span>
              <span>Pending</span>
            </div>
          </div>
              </>
            )
          })()}
        </>
      )}
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="bg-white border-2 border-ink p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold font-mono text-zinc-500 uppercase">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-3xl font-display text-ink dark:text-cream">{value}</div>
    </div>
  )
}
