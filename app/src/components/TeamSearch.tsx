'use client'

import { useState, useEffect, useRef } from 'react'
import { Team, loadTeamsFromCSV } from '@/lib/collegeData'
import { getTeams, type Team as APITeam } from '@/lib/api/teams'
import { TeamLogo } from '@/components/TeamLogo'
import { Search, X } from 'lucide-react'
import { useTheme } from 'next-themes'

function mapAPITeamToTeam(apiTeam: APITeam): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.display_name || apiTeam.school,
    school: apiTeam.school,
    conference: apiTeam.conference?.name,
    abbreviation: apiTeam.abbreviation,
    apiId: apiTeam.id,
    logo: undefined,
  }
}

interface TeamSearchProps {
  onSelect: (team: Team) => void
  placeholder?: string
  className?: string
  excludeTeamId?: string
  predictableOnly?: boolean
}

export function TeamSearch({ onSelect, placeholder = 'Search teams...', className = '', excludeTeamId, predictableOnly = false }: TeamSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Team[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (predictableOnly) {
      setLoading(true)
      setError(null)
      getTeams({ predictable: true, limit: 500 })
        .then((res) => {
          setAllTeams((res.teams || []).map(mapAPITeamToTeam))
        })
        .catch((err) => {
          console.error('Failed to load predictable teams:', err)
          setError('Could not load teams.')
          setAllTeams([])
        })
        .finally(() => setLoading(false))
    } else {
      loadTeamsFromCSV({ dark: theme === 'dark' }).then(setAllTeams)
    }
  }, [theme, predictableOnly])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (text: string) => {
    setQuery(text)
    if (!text.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const search = text.toLowerCase()
    const filtered = allTeams
      .filter((team) => {
        if (excludeTeamId && team.id === excludeTeamId) return false
        return (
          team.name.toLowerCase().includes(search) ||
          team.school?.toLowerCase().includes(search) ||
          (team.abbreviation?.toLowerCase().includes(search)) ||
          (team.conference?.toLowerCase().includes(search))
        )
      })
      .slice(0, 10)

    setResults(filtered)
    setIsOpen(true)
  }

  const handleSelect = (team: Team) => {
    onSelect(team)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={predictableOnly && loading ? 'Loading teams...' : placeholder}
          disabled={predictableOnly && loading}
          className="w-full pl-9 pr-4 py-2 bg-white border-2 border-ink focus:outline-none focus:border-hoops dark:bg-black dark:border-cream dark:text-cream font-mono text-sm disabled:opacity-60"
        />
        {query && (
          <button 
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-ink dark:hover:text-cream"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {predictableOnly && error && (
        <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto dark:bg-black dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          {results.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSelect(team)}
              className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <TeamLogo teamName={team.school || team.name} logoUrl={team.logo} size={24} />
              <div className="flex-1">
                <div className="font-bold text-sm text-ink dark:text-cream">{team.name}</div>
                <div className="text-xs text-zinc-500 font-mono">{team.conference}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
