export interface College {
  id: string
  sourceId: string
  school: string
  mascot: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  primaryColor: string
  secondaryColor: string
  currentVenueId: string
  currentVenue: string
  currentCity: string
  currentState: string
  conferenceId: string
  conference: string
}

export interface Team {
  id: string
  name: string
  conference?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
}

/**
 * Parse CSV line handling quoted fields
 * This CSV format has all fields quoted, so we can use a simpler approach
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      // Check if it's an escaped quote (double quote)
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (only when not in quotes)
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last field
  result.push(current.trim())
  return result
}

/**
 * Parse CSV text into College objects
 */
function parseCSV(csvText: string): College[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Skip header line
  const dataLines = lines.slice(1)
  const colleges: College[] = []

  for (const line of dataLines) {
    if (!line.trim()) continue

    const fields = parseCSVLine(line)
    if (fields.length < 15) continue

    colleges.push({
      id: fields[0],
      sourceId: fields[1],
      school: fields[2],
      mascot: fields[3],
      abbreviation: fields[4],
      displayName: fields[5],
      shortDisplayName: fields[6],
      primaryColor: fields[7],
      secondaryColor: fields[8],
      currentVenueId: fields[9],
      currentVenue: fields[10],
      currentCity: fields[11],
      currentState: fields[12],
      conferenceId: fields[13],
      conference: fields[14],
    })
  }

  return colleges
}

/**
 * Convert a school name to a URL-friendly ID
 */
function generateTeamId(schoolName: string, abbreviation?: string): string {
  // Use abbreviation if available (it's usually the most concise)
  if (abbreviation && abbreviation.trim() && abbreviation !== 'UNKNOWN') {
    return abbreviation.toLowerCase().trim()
  }
  
  // Otherwise generate from school name
  return schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Special mappings for schools where the logo filename doesn't match the generated pattern
 * Maps school name -> logo filename (without .svg extension)
 */
const LOGO_SPECIAL_MAPPINGS: Record<string, string> = {
  'San José State': 'San_Jos_State',
  'IU Indianapolis': 'IUPUI',
  'Massachusetts': 'UMass',
  'App State': 'Appalachian_State',
  'Cal State Bakersfield': 'CSU_Bakersfield',
  'Cal State Fullerton': 'CSU_Fullerton',
  'Cal State Northridge': 'CSU_Northridge',
  'San Francisco': 'San_Francisco_State',
  'St. Thomas-Minnesota': 'St_Thomas_-_Minnesota',
  'Pittsburgh': 'Pittsburgh_Bradford', // Logo file named Pittsburgh_Bradford but contains main Pittsburgh logo
  // State vs St_ pattern
  'Adams State': 'Adams_St_',
  'Angelo State': 'Angelo_St_',
  'Bowie State': 'Bowie_St_',
  'Chadron State': 'Chadron_St_',
  'Delta State': 'Delta_St_',
  'Jackson State': 'Jackson_St_',
  'Minot State': 'Minot_St_',
  'Valdosta State': 'Valdosta_St_',
  'Ferris State': 'Ferris_St_',
  'Grand Valley State': 'Grand_Valley_St_',
  // College without "College" suffix
  'Albright College': 'Albright',
  'Carleton College': 'Carleton',
  'Curry College': 'Curry',
  'Dean College': 'Dean',
  'Hendrix College': 'Hendrix',
  'Hobart College': 'Hobart',
  'Ithaca College': 'Ithaca',
  'Juniata College': 'Juniata',
  'Presbyterian': 'Presbyterian_College',
  // Abbreviated patterns
  'Central Washington': 'Central_Wash_',
  'Kentucky Wesleyan': 'Ky_Wesleyan',
  'SUNY-Brockport': 'Brockport',
  'UAlbany': 'Albany',
  // Special cases
  'Truman State': 'Truman',
  'Centre (KY)': 'Centre',
  'Carroll (MT)': 'Carroll',
  'Carson-Newman': 'Carson-Newman',
  'Hampden-Sydney': 'Hampden-Sydney',
  'Hardin-Simmons': 'Hardin-Simmons',
  'FDU Florham': 'FDU-Florham',
  'Lenoir-Rhyne': 'Lenoir-Rhyne',
  // Additional verified mappings
  'Allen University': 'Allen',
  'Amherst': 'Amherst_College',
  'Arkansas-Monticello': 'Ark_-Monticello',
  'Bridgewater College (VA)': 'Bridgewater',
  'Central Missouri': 'Central_Mo_',
  'Central State (OH)': 'Central_St_OH_',
  'Charleston': 'Charleston_WV_',
  'Colorado School Of Mines': 'Colo_Sch_of_Mines',
  'Concordia-St. Paul': 'Concordia-St_Paul',
  'Dickinson College': 'Dickinson',
  'Emory & Henry': 'Emory_and_Henry',
  'Endicott College': 'Endicott',
  'Houston Christian': 'Houston_Baptist',
  'Kentucky State': 'Kentucky_St_',
  'Lane College': 'Lane',
  'Loyola Maryland': 'Loyola_MD_',
  'Maryville College (TN)': 'Maryville_Tenn_',
  'Nebraska-Kearney': 'Neb_-Kearney',
  'New Mexico Highlands': 'N_M_Highlands',
  'Nichols College': 'Nichols',
  'Northwestern Oklahoma State': 'Northwestern_Okla_',
  'Northwood University': 'Northwood',
  'Oklahoma Baptist': 'Okla_Baptist',
  'Prairie View A&M': 'Prairie_View',
  'Sam Houston': 'Sam_Houston_State',
  'Savannah State': 'Savannah_St_',
  'Seton Hill': 'Seton_Hill_College',
  'Simpson College (IA)': 'Simpson',
  'Southeastern Oklahoma State': 'Southeastern_Okla_',
  'Southern Miss': 'Southern_Mississippi',
  'St. John\'s': 'St_Johns_MN_',
  'Tarleton State': 'Tarleton',
  'Texas A&M-Corpus Christi': 'Texas_A_M-CC',
  'Texas A&M-Kingsville': 'Tex_A_M-Kingsville',
  'Texas College': 'Texas_Col_',
  'Trine University': 'Trine',
  'Trinity (CT)': 'Trinity_Conn_',
  'Trinity (TX)': 'Trinity_Texas_',
  'Trinity Christian (IL)': 'Trinity_IL_',
  'UT Permian Basin': 'Tex_Permian_Basin',
  'UTSA': 'UT_San_Antonio',
  'UVA Wise': 'UVa-Wise',
  'University of Mary': 'Mary',
  'Virginia-Lynchburg': 'Virginia-Lynchburg',
  'Washington & Jefferson': 'Washington_and_Jefferson',
  'Wayne State (MI)': 'Wayne_St_MI_',
  'Wayne State (NE)': 'Wayne_St_NE_',
  'West Alabama': 'West_Ala_',
  'West Georgia': 'West_Ga_',
  'West Texas A&M': 'West_Tex_A_M',
  'West Virginia': 'West_Virginia_St_',
  'West Virginia Wesleyan': 'West_Va_Wesleyan',
  'Western New Mexico': 'Western_N_M_',
  'Western Oregon': 'Western_Ore_',
  'Westminster (PA)': 'Westminster_Pa_',
  'Wheaton (IL)': 'Wheaton_Ill_',
  'Wilkes University': 'Wilkes',
  'William Jewell': 'William_Jewell_College',
  'Winston-Salem': 'Winston-Salem',
  'Wisconsin-Stevens Point': 'UW-Stevens_Point',
  'Wisconsin-Stout': 'UW-Stout',
  'Worcester State': 'Worcester_State_College',
  'Wright State': 'Wright_State_University',
  // Additional mappings from user's list
  'Alfred State': 'Alfred',
  'Alvernia College': 'Alvernia',
  'Augusta': 'Augustana_SD_',
  'Bethany (KS)': 'Bethany',
  'Bethel (IN)': 'Bethel',
  'Central Arkansas': 'Central',
  'College of New Jersey': 'TCNJ',
  'Lock Haven University': 'Lock_Haven',
  'Missouri Southern State': 'Mo_Southern_St_',
  'Montana-Western': 'Montana-Western',
  'Union (NY)': 'Union',
  'Wesleyan (CT)': 'Wesleyan',
  'Minnesota Duluth': 'Minnesota-Duluth',
  'Minnesota Morris': 'Minnesota-Morris',
}

/**
 * Convert a school name to a logo filename
 * Handles patterns like: "Alabama A&M" -> "Alabama_A_M.svg"
 * Uses special mappings for schools with non-standard logo file names
 */
function generateLogoPath(schoolName: string): string | undefined {
  if (!schoolName || !schoolName.trim()) {
    return undefined
  }

  // Check special mappings first
  if (schoolName in LOGO_SPECIAL_MAPPINGS) {
    return `/cfb_logos_svg/${LOGO_SPECIAL_MAPPINGS[schoolName]}.svg`
  }

  // Convert school name to logo filename pattern
  const logoName = schoolName
    // Handle special characters first
    .replace(/é/g, 'e').replace(/É/g, 'E')  // Remove accents
    .replace(/'/g, '')  // Remove apostrophes (e.g., "Hawai'i" -> "Hawaii", "Saint Mary's" -> "Saint_Marys")
    // Handle "A&M" -> "A_M" (must be before general & replacement)
    .replace(/A\s*&\s*M/gi, 'A_M')
    // Handle "&" -> "_"
    .replace(/&/g, '_')
    // Handle parentheses content like "(GA)" -> "_GA_"
    .replace(/\s*\(([^)]+)\)/g, '_$1_')
    // Handle "St." -> "St_" (before removing periods)
    .replace(/\bSt\.\s+/gi, 'St_')
    // Handle "State" -> "State" (keep it, don't convert to St_)
    // Handle periods (but keep them if part of "St.")
    .replace(/\./g, '')
    // Handle hyphens -> underscores
    .replace(/-/g, '_')
    // Handle spaces -> underscores
    .replace(/\s+/g, '_')
    // Handle multiple underscores
    .replace(/_+/g, '_')
    // Remove trailing/leading underscores
    .replace(/^_+|_+$/g, '')
  
  // Return the logo path (logo files are in /cfb_logos_svg/)
  return `/cfb_logos_svg/${logoName}.svg`
}

/**
 * Load and parse college data from CSV
 */
export async function loadCollegeData(): Promise<College[]> {
  try {
    const response = await fetch('/collegedata/collegeData.csv')
    if (!response.ok) {
      throw new Error(`Failed to load college data: ${response.statusText}`)
    }
    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error('Error loading college data:', error)
    return []
  }
}

/**
 * Convert College data to Team format
 */
export function convertCollegeToTeam(college: College): Team {
  // Generate ID from abbreviation or school name
  const id = generateTeamId(college.school, college.abbreviation)
  
  // Use DisplayName or School as the name (DisplayName is usually "School Mascot")
  const name = college.displayName || college.school
  
  // Conference might be empty, so make it optional
  const conference = college.conference?.trim() || undefined

  // Generate logo path from school name
  const logo = generateLogoPath(college.school)

  // Handle colors (may be empty strings in CSV)
  const primaryColor = college.primaryColor?.trim() || undefined
  const secondaryColor = college.secondaryColor?.trim() || undefined

  return {
    id,
    name,
    conference,
    logo,
    primaryColor,
    secondaryColor,
  }
}

/**
 * Load all teams from CSV
 */
export async function loadAllTeams(): Promise<Team[]> {
  const colleges = await loadCollegeData()
  
  // Filter out entries with empty school names and convert to teams
  const teams = colleges
    .filter((college) => college.school && college.school.trim())
    .map(convertCollegeToTeam)
  
  // Remove duplicates based on ID (in case there are multiple entries for the same team)
  const uniqueTeams = Array.from(
    new Map(teams.map((team) => [team.id, team])).values()
  )
  
  // Sort alphabetically by name
  return uniqueTeams.sort((a, b) => a.name.localeCompare(b.name))
}
