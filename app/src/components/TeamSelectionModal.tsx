'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { X, Search, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { loadTeamsFromCSV, type Team } from '@/lib/collegeData'
import { TeamLogo } from './TeamLogo'
import { useTheme } from 'next-themes'

interface TeamSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTeams: Team[]
  onSelectTeam: (team: Team) => void
  onDeselectTeam: (teamId: string) => void
}

interface ConferenceGroup {
  conference: string
  teams: Team[]
}

export function TeamSelectionModal({
  isOpen,
  onClose,
  selectedTeams,
  onSelectTeam,
  onDeselectTeam,
}: TeamSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConference, setSelectedConference] = useState<string>('')
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [expandedConferences, setExpandedConferences] = useState<Set<string>>(new Set())
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Load teams from local CSV + SVG logos (fast, no API)
  useEffect(() => {
    loadTeamsFromCSV({ dark: isDark })
      .then((teams) => {
        setAllTeams(teams)
        setIsLoadingTeams(false)
        // Expand all conferences by default
        const allConferences = new Set(teams.map(t => t.conference).filter(Boolean) as string[])
        setExpandedConferences(allConferences)
      })
      .catch((error) => {
        console.error('Error loading teams:', error)
        setIsLoadingTeams(false)
      })
  }, [isDark])

  // Get all unique conferences
  const allConferences = useMemo(() => {
    const conferences = new Set<string>()
    allTeams.forEach(team => {
      if (team.conference) {
        conferences.add(team.conference)
      }
    })
    return Array.from(conferences).sort()
  }, [allTeams])

  // Filter teams based on search query and selected conference
  const filteredTeams = useMemo(() => {
    let teams = allTeams

    // Filter by conference if selected
    if (selectedConference) {
      teams = teams.filter(team => team.conference === selectedConference)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      teams = teams.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.conference?.toLowerCase().includes(query)
      )
    }

    return teams
  }, [searchQuery, selectedConference, allTeams])

  // Group teams by conference (only when not searching)
  const teamsByConference = useMemo(() => {
    if (searchQuery.trim() || selectedConference) {
      return null // Don't group when searching or filtering by conference
    }

    const groups: ConferenceGroup[] = []
    const conferenceMap = new Map<string, Team[]>()

    filteredTeams.forEach(team => {
      const conf = team.conference || 'Other'
      if (!conferenceMap.has(conf)) {
        conferenceMap.set(conf, [])
      }
      conferenceMap.get(conf)!.push(team)
    })

    // Sort conferences alphabetically
    const sortedConferences = Array.from(conferenceMap.keys()).sort()
    
    sortedConferences.forEach(conference => {
      const teams = conferenceMap.get(conference)!
      teams.sort((a, b) => a.name.localeCompare(b.name))
      groups.push({ conference, teams })
    })

    return groups
  }, [filteredTeams, searchQuery, selectedConference])

  // Toggle conference expansion
  const toggleConference = (conference: string) => {
    setExpandedConferences(prev => {
      const next = new Set(prev)
      if (next.has(conference)) {
        next.delete(conference)
      } else {
        next.add(conference)
      }
      return next
    })
  }

  // Check if a team is selected
  const isTeamSelected = (teamId: string) => {
    return selectedTeams.some((team) => team.id === teamId)
  }

  // Handle team toggle
  const handleTeamToggle = (team: Team) => {
    if (isTeamSelected(team.id)) {
      onDeselectTeam(team.id)
    } else {
      onSelectTeam(team)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-cream border-4 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-ink dark:border-cream">
          <h2 className="text-2xl font-display text-ink uppercase tracking-tight dark:text-cream">
            Select Teams
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-ink hover:bg-ink hover:text-cream transition-colors dark:border-cream dark:hover:bg-cream dark:hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b-2 border-ink dark:border-cream space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search teams or conferences..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                // Clear conference filter when searching
                if (e.target.value.trim()) {
                  setSelectedConference('')
                }
              }}
              className="w-full pl-12 pr-4 py-3 border-2 border-ink bg-white text-ink placeholder-zinc-500 focus:outline-none focus:border-hoops font-mono text-sm dark:bg-zinc-900 dark:border-cream dark:text-cream dark:placeholder-zinc-400"
            />
          </div>
          
          {/* Conference Filter */}
          {!searchQuery.trim() && (
            <div>
              <label className="block text-xs font-mono font-bold text-ink uppercase tracking-wide mb-2 dark:text-cream">
                Filter by Conference
              </label>
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full px-4 py-2 border-2 border-ink bg-white text-ink font-mono text-sm focus:outline-none focus:border-hoops dark:bg-zinc-900 dark:border-cream dark:text-cream"
              >
                <option value="">All Conferences</option>
                {allConferences.map((conf) => (
                  <option key={conf} value={conf}>
                    {conf}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <p className="text-xs text-zinc-600 font-mono uppercase tracking-wide dark:text-zinc-400">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} found
            {selectedConference && ` in ${selectedConference}`}
          </p>
        </div>

        {/* Team List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
          {isLoadingTeams ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full border-2 border-hoops border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-lg font-display text-ink uppercase dark:text-cream mb-1">
                Loading teams
              </p>
              <p className="text-xs text-zinc-500 font-mono dark:text-zinc-400">
                CSV + logos loading…
              </p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-display text-ink uppercase dark:text-cream mb-2">
                No teams found
              </p>
              <p className="text-sm text-zinc-600 font-mono dark:text-zinc-400">
                Try a different search term or conference filter
              </p>
            </div>
          ) : teamsByConference ? (
            // Grouped by conference view (when not searching)
            <div className="animate-fade-in">
            {teamsByConference.map((group) => {
              const isExpanded = expandedConferences.has(group.conference)
              const selectedCount = group.teams.filter(t => isTeamSelected(t.id)).length
              
              return (
                <div key={group.conference} className="space-y-2">
                  {/* Conference Header */}
                  <button
                    onClick={() => toggleConference(group.conference)}
                    className="w-full flex items-center justify-between p-3 bg-zinc-100 border-2 border-ink hover:bg-zinc-200 transition-colors dark:bg-zinc-900 dark:border-cream dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-ink dark:text-cream" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ink dark:text-cream" />
                      )}
                      <span className="font-display text-base text-ink uppercase tracking-wide dark:text-cream">
                        {group.conference}
                      </span>
                      <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        ({group.teams.length} {group.teams.length === 1 ? 'team' : 'teams'})
                      </span>
                      {selectedCount > 0 && (
                        <span className="text-xs font-mono font-bold text-hoops">
                          {selectedCount} selected
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Teams in Conference */}
                  {isExpanded && (
                    <div className="pl-4 space-y-2 border-l-2 border-ink dark:border-cream">
                      {group.teams.map((team) => {
                        const selected = isTeamSelected(team.id)
                        return (
                          <button
                            key={team.id}
                            onClick={() => handleTeamToggle(team)}
                            className={`w-full flex items-center gap-3 p-3 border-2 transition-all text-left group ${
                              selected
                                ? 'bg-hoops text-white border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                                : 'bg-white border-ink hover:bg-zinc-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                            }`}
                          >
                            {/* Logo — use precomputed team.logo from CSV for instant SVG load */}
                            <TeamLogo teamName={team.school || team.name} logoUrl={team.logo} size={32} />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-display text-base uppercase tracking-wide truncate ${
                                  selected ? 'text-white' : 'text-ink dark:text-cream'
                                }`}
                              >
                                {team.name}
                              </p>
                            </div>
                            {selected && (
                              <div className="ml-auto w-5 h-5 flex items-center justify-center border-2 border-white rounded-full bg-white/20 flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          ) : (
            <div className="animate-fade-in">
            {filteredTeams.map((team) => {
              const selected = isTeamSelected(team.id)
              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamToggle(team)}
                  className={`w-full flex items-center gap-3 p-4 border-2 transition-all text-left group ${
                    selected
                      ? 'bg-hoops text-white border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                      : 'bg-white border-ink hover:bg-zinc-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  }`}
                >
                  {/* Logo — use precomputed team.logo from CSV for instant SVG load */}
                  <TeamLogo teamName={team.school || team.name} logoUrl={team.logo} size={40} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-display text-lg uppercase tracking-wide ${
                        selected ? 'text-white' : 'text-ink dark:text-cream'
                      }`}
                    >
                      {team.name}
                    </p>
                    {team.conference && (
                      <p
                        className={`text-xs font-mono uppercase tracking-wide mt-1 ${
                          selected
                            ? 'text-white/80'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {team.conference}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <div className="ml-auto w-6 h-6 flex items-center justify-center border-2 border-white rounded-full bg-white/20 flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-ink dark:border-cream bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-mono text-ink uppercase tracking-wide dark:text-cream">
              {selectedTeams.length} {selectedTeams.length === 1 ? 'team' : 'teams'} selected
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-ink text-cream border-2 border-ink font-mono font-bold uppercase tracking-wide hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:bg-cream dark:text-ink dark:border-cream dark:hover:bg-zinc-100 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
