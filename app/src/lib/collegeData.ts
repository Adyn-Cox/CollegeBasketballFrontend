/**
 * College Data Utilities
 * 
 * Provides functions to load team data from the API or from local CSV.
 * Local CSV + SVG logos load instantly without API round-trips.
 * 
 * Uses caching to avoid repeated CSV parsing.
 */

import { getTeams, type Team as APITeam } from './api/teams'
import { getLogoUrl, getLogoUrlBySlug, generateSlugFromName, preloadSlugMapping } from './logoApi'

// ============================================================================
// Types
// ============================================================================

/**
 * Frontend Team interface (compatible with existing components)
 */
export interface Team {
  id: string
  name: string
  conference?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  // Additional fields from API
  apiId?: number
  sourceId?: string
  school?: string
  mascot?: string
  abbreviation?: string
  displayName?: string
  shortDisplayName?: string
}

// ============================================================================
// CSV Caching
// ============================================================================

interface CachedTeams {
  light: Team[]
  dark: Team[]
}

let teamsCache: CachedTeams | null = null
let teamsCachePromise: Promise<CachedTeams> | null = null

/** Parse one CSV line (quoted fields separated by comma) */
function parseCSVLine(line: string): string[] {
  const parts = line.split('","')
  if (parts.length === 1) return line.split(',').map(s => s.replace(/^"|"$/g, '').trim())
  parts[0] = parts[0].replace(/^"/, '').trim()
  parts[parts.length - 1] = parts[parts.length - 1].replace(/"$/, '').trim()
  return parts
}

/** Parse CSV and build teams for both light and dark modes */
async function parseCSV(): Promise<CachedTeams> {
  // Preload slug mapping in parallel
  preloadSlugMapping()
  
  const [csvRes, mappingRes] = await Promise.all([
    fetch('/collegedata/collegeData.csv'),
    fetch('/team-logos/slug-mapping.json').catch(() => null),
  ])
  
  if (!csvRes.ok) {
    return { light: [], dark: [] }
  }
  
  const csvText = await csvRes.text()
  let nameToSlug: Record<string, string> = {}
  
  if (mappingRes?.ok) {
    try {
      const json = await mappingRes.json()
      nameToSlug = (json.nameToSlug as Record<string, string>) || {}
    } catch {
      /* ignore */
    }
  }

  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    return { light: [], dark: [] }
  }
  
  const header = parseCSVLine(lines[0])
  const schoolIdx = header.indexOf('School')
  const abbrIdx = header.indexOf('Abbreviation')
  const displayIdx = header.indexOf('DisplayName')
  const primaryIdx = header.indexOf('PrimaryColor')
  const secondaryIdx = header.indexOf('SecondaryColor')
  const conferenceIdx = header.indexOf('Conference')
  const idIdx = header.indexOf('Id')
  const logoLightIdx = header.indexOf('LogoLight')
  const logoDarkIdx = header.indexOf('LogoDark')
  
  if (schoolIdx === -1) {
    return { light: [], dark: [] }
  }

  const lightTeams: Team[] = []
  const darkTeams: Team[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    const school = row[schoolIdx]?.trim()
    if (!school) continue
    
    const displayName = (displayIdx >= 0 && row[displayIdx]) ? row[displayIdx].trim() : school
    const abbreviation = (abbrIdx >= 0 && row[abbrIdx]) ? row[abbrIdx].trim() : ''
    const conference = (conferenceIdx >= 0 && row[conferenceIdx]) ? row[conferenceIdx].trim() : undefined
    const primaryHex = (primaryIdx >= 0 && row[primaryIdx]) ? row[primaryIdx].trim() : ''
    const secondaryHex = (secondaryIdx >= 0 && row[secondaryIdx]) ? row[secondaryIdx].trim() : ''
    const rawId = (idIdx >= 0 && row[idIdx]) ? row[idIdx].trim() : ''
    const apiId = rawId ? parseInt(rawId, 10) : NaN
    if (rawId && Number.isNaN(apiId)) continue

    const slug =
      nameToSlug[school.toLowerCase()] ??
      nameToSlug[displayName.toLowerCase()] ??
      generateSlugFromName(school)
    
    const logoLightSlug = (logoLightIdx >= 0 && row[logoLightIdx]?.trim()) ? row[logoLightIdx].trim() : null
    const logoDarkSlug = (logoDarkIdx >= 0 && row[logoDarkIdx]?.trim()) ? row[logoDarkIdx].trim() : null
    
    const id = abbreviation
      ? abbreviation.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : school.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const baseTeam = {
      id,
      name: displayName || school,
      school,
      conference: conference || undefined,
      primaryColor: primaryHex ? (primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`) : undefined,
      secondaryColor: secondaryHex ? (secondaryHex.startsWith('#') ? secondaryHex : `#${secondaryHex}`) : undefined,
      apiId: Number.isNaN(apiId) ? undefined : apiId,
      abbreviation: abbreviation || undefined,
    }

    // Light mode team
    const lightLogoSlug = logoLightSlug ?? logoDarkSlug ?? slug
    lightTeams.push({
      ...baseTeam,
      logo: getLogoUrlBySlug(lightLogoSlug, false),
    })

    // Dark mode team
    const darkLogoSlug = logoDarkSlug ?? logoLightSlug ?? slug
    darkTeams.push({
      ...baseTeam,
      logo: getLogoUrlBySlug(darkLogoSlug, true),
    })
  }

  // Sort alphabetically
  lightTeams.sort((a, b) => a.name.localeCompare(b.name))
  darkTeams.sort((a, b) => a.name.localeCompare(b.name))

  return { light: lightTeams, dark: darkTeams }
}

/** Load and cache teams from CSV */
async function loadAndCacheTeams(): Promise<CachedTeams> {
  if (teamsCache) {
    return teamsCache
  }
  
  if (teamsCachePromise) {
    return teamsCachePromise
  }
  
  teamsCachePromise = parseCSV()
    .then((result) => {
      teamsCache = result
      return result
    })
    .catch((error) => {
      console.error('Error loading teams from CSV:', error)
      return { light: [], dark: [] }
    })
    .finally(() => {
      teamsCachePromise = null
    })
  
  return teamsCachePromise
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Load all teams from local CSV + SVG logos (fast, cached).
 * Use this for the team selection modal so teams and logos load instantly.
 */
export async function loadTeamsFromCSV(options?: { dark?: boolean }): Promise<Team[]> {
  const cached = await loadAndCacheTeams()
  return options?.dark ? cached.dark : cached.light
}

/**
 * Preload teams cache (call early in app lifecycle)
 */
export function preloadTeams(): void {
  loadAndCacheTeams()
}

/**
 * Convert API Team to frontend Team format
 */
export async function convertAPITeamToTeam(apiTeam: APITeam, dark: boolean = false): Promise<Team> {
  const id = apiTeam.abbreviation?.toLowerCase() || 
             apiTeam.school.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  const logo = await getLogoUrl(apiTeam.school, dark)
  
  const primaryColor = apiTeam.primary_color 
    ? (apiTeam.primary_color.startsWith('#') ? apiTeam.primary_color : `#${apiTeam.primary_color}`)
    : undefined
  const secondaryColor = apiTeam.secondary_color
    ? (apiTeam.secondary_color.startsWith('#') ? apiTeam.secondary_color : `#${apiTeam.secondary_color}`)
    : undefined

  return {
    id,
    name: apiTeam.display_name || apiTeam.school,
    conference: apiTeam.conference?.abbreviation || apiTeam.conference?.name,
    logo: logo ?? undefined,
    primaryColor,
    secondaryColor,
    apiId: apiTeam.id,
    sourceId: apiTeam.source_id,
    school: apiTeam.school,
    mascot: apiTeam.mascot,
    abbreviation: apiTeam.abbreviation,
    displayName: apiTeam.display_name,
    shortDisplayName: apiTeam.short_display_name,
  }
}

/**
 * Load all teams from API.
 * Supports pagination and filtering.
 */
export async function loadAllTeams(
  options?: {
    search?: string
    conference?: string
    limit?: number
    dark?: boolean
  }
): Promise<Team[]> {
  try {
    const batchSize = 500
    const requestedLimit = options?.limit || 2000
    
    let allTeams: APITeam[] = []
    let offset = 0
    let total = 0
    
    do {
      const remaining = requestedLimit - allTeams.length
      if (remaining <= 0) break
      
      const currentLimit = Math.min(batchSize, remaining)
      
      const response = await getTeams({
        search: options?.search,
        conference: options?.conference,
        limit: currentLimit,
        offset,
      })
      
      allTeams = allTeams.concat(response.teams)
      total = response.total
      offset += currentLimit
      
      if (allTeams.length >= total) break
    } while (allTeams.length < requestedLimit)
    
    const teams = await Promise.all(
      allTeams.map(team => convertAPITeamToTeam(team, options?.dark || false))
    )
    
    return teams.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error loading teams from API:', error)
    return []
  }
}

/**
 * Load a single team by ID
 */
export async function loadTeam(teamId: number, dark: boolean = false): Promise<Team | null> {
  try {
    const { getTeam } = await import('./api/teams')
    const apiTeam = await getTeam(teamId)
    return convertAPITeamToTeam(apiTeam, dark)
  } catch (error) {
    console.error(`Error loading team ${teamId}:`, error)
    return null
  }
}

/**
 * Export getLogoUrl for direct use in components
 */
export { getLogoUrl } from './logoApi'
