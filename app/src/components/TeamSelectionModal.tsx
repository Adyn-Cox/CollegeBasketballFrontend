'use client'

import React, { useState, useMemo } from 'react'
import { X, Search, Check } from 'lucide-react'

interface Team {
  id: string
  name: string
  conference?: string
}

interface TeamSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTeams: Team[]
  onSelectTeam: (team: Team) => void
  onDeselectTeam: (teamId: string) => void
}

// Comprehensive list of Division I college basketball teams (alphabetically ordered)
const ALL_TEAMS: Team[] = [
  { id: 'air-force', name: 'Air Force', conference: 'Mountain West' },
  { id: 'akron', name: 'Akron', conference: 'MAC' },
  { id: 'alabama', name: 'Alabama', conference: 'SEC' },
  { id: 'albany', name: 'Albany', conference: 'America East' },
  { id: 'appalachian-state', name: 'Appalachian State', conference: 'Sun Belt' },
  { id: 'arizona', name: 'Arizona', conference: 'Pac-12' },
  { id: 'arizona-state', name: 'Arizona State', conference: 'Pac-12' },
  { id: 'arkansas', name: 'Arkansas', conference: 'SEC' },
  { id: 'arkansas-state', name: 'Arkansas State', conference: 'Sun Belt' },
  { id: 'auburn', name: 'Auburn', conference: 'SEC' },
  { id: 'austin-peay', name: 'Austin Peay', conference: 'ASUN' },
  { id: 'ball-state', name: 'Ball State', conference: 'MAC' },
  { id: 'baylor', name: 'Baylor', conference: 'Big 12' },
  { id: 'belmont', name: 'Belmont', conference: 'Missouri Valley' },
  { id: 'boise-state', name: 'Boise State', conference: 'Mountain West' },
  { id: 'boston-college', name: 'Boston College', conference: 'ACC' },
  { id: 'boston-university', name: 'Boston University', conference: 'Patriot' },
  { id: 'bowling-green', name: 'Bowling Green', conference: 'MAC' },
  { id: 'bradley', name: 'Bradley', conference: 'Missouri Valley' },
  { id: 'brown', name: 'Brown', conference: 'Ivy League' },
  { id: 'bryant', name: 'Bryant', conference: 'America East' },
  { id: 'buffalo', name: 'Buffalo', conference: 'MAC' },
  { id: 'butler', name: 'Butler', conference: 'Big East' },
  { id: 'byu', name: 'BYU', conference: 'Big 12' },
  { id: 'california', name: 'California', conference: 'ACC' },
  { id: 'cal-poly', name: 'Cal Poly', conference: 'Big West' },
  { id: 'cal-state-bakersfield', name: 'Cal State Bakersfield', conference: 'Big West' },
  { id: 'cal-state-fullerton', name: 'Cal State Fullerton', conference: 'Big West' },
  { id: 'cal-state-northridge', name: 'Cal State Northridge', conference: 'Big West' },
  { id: 'campbell', name: 'Campbell', conference: 'CAA' },
  { id: 'canisius', name: 'Canisius', conference: 'MAAC' },
  { id: 'central-arkansas', name: 'Central Arkansas', conference: 'ASUN' },
  { id: 'central-connecticut', name: 'Central Connecticut', conference: 'NEC' },
  { id: 'central-michigan', name: 'Central Michigan', conference: 'MAC' },
  { id: 'charleston', name: 'Charleston', conference: 'CAA' },
  { id: 'charlotte', name: 'Charlotte', conference: 'American' },
  { id: 'chicago-state', name: 'Chicago State', conference: 'Independent' },
  { id: 'cincinnati', name: 'Cincinnati', conference: 'Big 12' },
  { id: 'clemson', name: 'Clemson', conference: 'ACC' },
  { id: 'cleveland-state', name: 'Cleveland State', conference: 'Horizon' },
  { id: 'coastal-carolina', name: 'Coastal Carolina', conference: 'Sun Belt' },
  { id: 'colgate', name: 'Colgate', conference: 'Patriot' },
  { id: 'colorado', name: 'Colorado', conference: 'Pac-12' },
  { id: 'colorado-state', name: 'Colorado State', conference: 'Mountain West' },
  { id: 'columbia', name: 'Columbia', conference: 'Ivy League' },
  { id: 'connecticut', name: 'Connecticut', conference: 'Big East' },
  { id: 'coppin-state', name: 'Coppin State', conference: 'MEAC' },
  { id: 'cornell', name: 'Cornell', conference: 'Ivy League' },
  { id: 'creighton', name: 'Creighton', conference: 'Big East' },
  { id: 'dartmouth', name: 'Dartmouth', conference: 'Ivy League' },
  { id: 'davidson', name: 'Davidson', conference: 'Atlantic 10' },
  { id: 'dayton', name: 'Dayton', conference: 'Atlantic 10' },
  { id: 'delaware', name: 'Delaware', conference: 'CAA' },
  { id: 'delaware-state', name: 'Delaware State', conference: 'MEAC' },
  { id: 'denver', name: 'Denver', conference: 'Summit' },
  { id: 'depaul', name: 'DePaul', conference: 'Big East' },
  { id: 'detroit-mercy', name: 'Detroit Mercy', conference: 'Horizon' },
  { id: 'drake', name: 'Drake', conference: 'Missouri Valley' },
  { id: 'drexel', name: 'Drexel', conference: 'CAA' },
  { id: 'duke', name: 'Duke', conference: 'ACC' },
  { id: 'duquesne', name: 'Duquesne', conference: 'Atlantic 10' },
  { id: 'east-carolina', name: 'East Carolina', conference: 'American' },
  { id: 'east-tennessee-state', name: 'East Tennessee State', conference: 'Southern' },
  { id: 'eastern-illinois', name: 'Eastern Illinois', conference: 'OVC' },
  { id: 'eastern-kentucky', name: 'Eastern Kentucky', conference: 'ASUN' },
  { id: 'eastern-michigan', name: 'Eastern Michigan', conference: 'MAC' },
  { id: 'eastern-washington', name: 'Eastern Washington', conference: 'Big Sky' },
  { id: 'evansville', name: 'Evansville', conference: 'Missouri Valley' },
  { id: 'fairfield', name: 'Fairfield', conference: 'MAAC' },
  { id: 'fairleigh-dickinson', name: 'Fairleigh Dickinson', conference: 'NEC' },
  { id: 'florida', name: 'Florida', conference: 'SEC' },
  { id: 'florida-atlantic', name: 'Florida Atlantic', conference: 'American' },
  { id: 'florida-gulf-coast', name: 'Florida Gulf Coast', conference: 'ASUN' },
  { id: 'florida-international', name: 'Florida International', conference: 'C-USA' },
  { id: 'florida-state', name: 'Florida State', conference: 'ACC' },
  { id: 'fordham', name: 'Fordham', conference: 'Atlantic 10' },
  { id: 'fresno-state', name: 'Fresno State', conference: 'Mountain West' },
  { id: 'furman', name: 'Furman', conference: 'Southern' },
  { id: 'george-mason', name: 'George Mason', conference: 'Atlantic 10' },
  { id: 'george-washington', name: 'George Washington', conference: 'Atlantic 10' },
  { id: 'georgetown', name: 'Georgetown', conference: 'Big East' },
  { id: 'georgia', name: 'Georgia', conference: 'SEC' },
  { id: 'georgia-southern', name: 'Georgia Southern', conference: 'Sun Belt' },
  { id: 'georgia-state', name: 'Georgia State', conference: 'Sun Belt' },
  { id: 'georgia-tech', name: 'Georgia Tech', conference: 'ACC' },
  { id: 'gonzaga', name: 'Gonzaga', conference: 'WCC' },
  { id: 'grambling', name: 'Grambling', conference: 'SWAC' },
  { id: 'grand-canyon', name: 'Grand Canyon', conference: 'WAC' },
  { id: 'green-bay', name: 'Green Bay', conference: 'Horizon' },
  { id: 'hampton', name: 'Hampton', conference: 'CAA' },
  { id: 'hartford', name: 'Hartford', conference: 'America East' },
  { id: 'harvard', name: 'Harvard', conference: 'Ivy League' },
  { id: 'hawaii', name: 'Hawaii', conference: 'Big West' },
  { id: 'high-point', name: 'High Point', conference: 'Big South' },
  { id: 'hofstra', name: 'Hofstra', conference: 'CAA' },
  { id: 'houston', name: 'Houston', conference: 'Big 12' },
  { id: 'howard', name: 'Howard', conference: 'MEAC' },
  { id: 'idaho', name: 'Idaho', conference: 'Big Sky' },
  { id: 'idaho-state', name: 'Idaho State', conference: 'Big Sky' },
  { id: 'illinois', name: 'Illinois', conference: 'Big Ten' },
  { id: 'illinois-chicago', name: 'Illinois-Chicago', conference: 'Missouri Valley' },
  { id: 'illinois-state', name: 'Illinois State', conference: 'Missouri Valley' },
  { id: 'incarnate-word', name: 'Incarnate Word', conference: 'Southland' },
  { id: 'indiana', name: 'Indiana', conference: 'Big Ten' },
  { id: 'indiana-state', name: 'Indiana State', conference: 'Missouri Valley' },
  { id: 'iona', name: 'Iona', conference: 'MAAC' },
  { id: 'iowa', name: 'Iowa', conference: 'Big Ten' },
  { id: 'iowa-state', name: 'Iowa State', conference: 'Big 12' },
  { id: 'ipfw', name: 'Purdue Fort Wayne', conference: 'Horizon' },
  { id: 'jackson-state', name: 'Jackson State', conference: 'SWAC' },
  { id: 'texas-rio-grande-valley', name: 'UTRGV', conference: 'WAC' },
  { id: 'texas-san-antonio', name: 'UTSA', conference: 'American' },
  { id: 'texas-state', name: 'Texas State', conference: 'Sun Belt' },
  { id: 'texas-tech', name: 'Texas Tech', conference: 'Big 12' },
  { id: 'toledo', name: 'Toledo', conference: 'MAC' },
  { id: 'towson', name: 'Towson', conference: 'CAA' },
  { id: 'troy', name: 'Troy', conference: 'Sun Belt' },
  { id: 'tulane', name: 'Tulane', conference: 'American' },
  { id: 'tulsa', name: 'Tulsa', conference: 'American' },
  { id: 'uc-davis', name: 'UC Davis', conference: 'Big West' },
  { id: 'uc-irvine', name: 'UC Irvine', conference: 'Big West' },
  { id: 'uc-riverside', name: 'UC Riverside', conference: 'Big West' },
  { id: 'uc-santa-barbara', name: 'UC Santa Barbara', conference: 'Big West' },
  { id: 'uc-san-diego', name: 'UC San Diego', conference: 'Big West' },
  { id: 'ucla', name: 'UCLA', conference: 'Pac-12' },
  { id: 'umbc', name: 'UMBC', conference: 'America East' },
  { id: 'unc-asheville', name: 'UNC Asheville', conference: 'Big South' },
  { id: 'unc-greensboro', name: 'UNC Greensboro', conference: 'Southern' },
  { id: 'unc-wilmington', name: 'UNC Wilmington', conference: 'CAA' },
  { id: 'university-of-alabama-birmingham', name: 'UAB', conference: 'American' },
  { id: 'university-of-california-riverside', name: 'UC Riverside', conference: 'Big West' },
  { id: 'utah', name: 'Utah', conference: 'Pac-12' },
  { id: 'utah-state', name: 'Utah State', conference: 'Mountain West' },
  { id: 'utah-valley', name: 'Utah Valley', conference: 'WAC' },
  { id: 'utep', name: 'UTEP', conference: 'C-USA' },
  { id: 'ut-martin', name: 'UT Martin', conference: 'OVC' },
  { id: 'valparaiso', name: 'Valparaiso', conference: 'Missouri Valley' },
  { id: 'vanderbilt', name: 'Vanderbilt', conference: 'SEC' },
  { id: 'vcu', name: 'VCU', conference: 'Atlantic 10' },
  { id: 'vermont', name: 'Vermont', conference: 'America East' },
  { id: 'villanova', name: 'Villanova', conference: 'Big East' },
  { id: 'virginia', name: 'Virginia', conference: 'ACC' },
  { id: 'virginia-commonwealth', name: 'VCU', conference: 'Atlantic 10' },
  { id: 'virginia-tech', name: 'Virginia Tech', conference: 'ACC' },
  { id: 'wagner', name: 'Wagner', conference: 'NEC' },
  { id: 'wake-forest', name: 'Wake Forest', conference: 'ACC' },
  { id: 'washington', name: 'Washington', conference: 'Pac-12' },
  { id: 'washington-state', name: 'Washington State', conference: 'Pac-12' },
  { id: 'weber-state', name: 'Weber State', conference: 'Big Sky' },
  { id: 'west-virginia', name: 'West Virginia', conference: 'Big 12' },
  { id: 'western-carolina', name: 'Western Carolina', conference: 'Southern' },
  { id: 'western-illinois', name: 'Western Illinois', conference: 'OVC' },
  { id: 'western-kentucky', name: 'Western Kentucky', conference: 'C-USA' },
  { id: 'western-michigan', name: 'Western Michigan', conference: 'MAC' },
  { id: 'wichita-state', name: 'Wichita State', conference: 'American' },
  { id: 'william-mary', name: 'William & Mary', conference: 'CAA' },
  { id: 'winthrop', name: 'Winthrop', conference: 'Big South' },
  { id: 'wisconsin', name: 'Wisconsin', conference: 'Big Ten' },
  { id: 'wofford', name: 'Wofford', conference: 'Southern' },
  { id: 'wright-state', name: 'Wright State', conference: 'Horizon' },
  { id: 'wyoming', name: 'Wyoming', conference: 'Mountain West' },
  { id: 'xavier', name: 'Xavier', conference: 'Big East' },
  { id: 'yale', name: 'Yale', conference: 'Ivy League' },
  { id: 'youngstown-state', name: 'Youngstown State', conference: 'Horizon' },
]

export function TeamSelectionModal({
  isOpen,
  onClose,
  selectedTeams,
  onSelectTeam,
  onDeselectTeam,
}: TeamSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_TEAMS
    }
    
    const query = searchQuery.toLowerCase().trim()
    return ALL_TEAMS.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.conference?.toLowerCase().includes(query)
    )
  }, [searchQuery])

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

        {/* Search Bar */}
        <div className="p-6 border-b-2 border-ink dark:border-cream">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search teams or conferences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-ink bg-white text-ink placeholder-zinc-500 focus:outline-none focus:border-hoops font-mono text-sm dark:bg-zinc-900 dark:border-cream dark:text-cream dark:placeholder-zinc-400"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2 font-mono uppercase tracking-wide dark:text-zinc-400">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} found
          </p>
        </div>

        {/* Team List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-display text-ink uppercase dark:text-cream mb-2">
                No teams found
              </p>
              <p className="text-sm text-zinc-600 font-mono dark:text-zinc-400">
                Try a different search term
              </p>
            </div>
          ) : (
            filteredTeams.map((team) => {
              const selected = isTeamSelected(team.id)
              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamToggle(team)}
                  className={`w-full flex items-center justify-between p-4 border-2 transition-all text-left group ${
                    selected
                      ? 'bg-hoops text-white border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-cream dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                      : 'bg-white border-ink hover:bg-zinc-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:border-cream dark:hover:bg-zinc-900 dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  }`}
                >
                  <div className="flex-1">
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
                    <div className="ml-4 w-6 h-6 flex items-center justify-center border-2 border-white rounded-full bg-white/20">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              )
            })
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
