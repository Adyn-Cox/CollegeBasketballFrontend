/**
 * Logo API Utility
 * 
 * Provides functions to get logo URLs from locally downloaded files.
 * Logos are stored in /team-logos/ directory.
 * Supports both light and dark variants.
 * 
 * Uses caching to avoid repeated network requests for slug mapping.
 */

// ============================================================================
// Slug Mapping Cache
// ============================================================================

let slugMappingCache: Record<string, string> | null = null
let slugMappingPromise: Promise<Record<string, string>> | null = null

/**
 * Load and cache the slug mapping file
 */
async function loadSlugMapping(): Promise<Record<string, string>> {
  // Return cached data if available
  if (slugMappingCache !== null) {
    return slugMappingCache
  }
  
  // Return existing promise if already loading
  if (slugMappingPromise !== null) {
    return slugMappingPromise
  }
  
  // Start loading
  slugMappingPromise = (async (): Promise<Record<string, string>> => {
    try {
      const response = await fetch('/team-logos/slug-mapping.json')
      if (!response.ok) {
        return {}
      }
      const data = await response.json()
      return (data.nameToSlug as Record<string, string>) || {}
    } catch {
      // Mapping file not available - return empty object
      return {}
    }
  })()
  
  // Wait for the result, cache it, and clear the promise
  const result = await slugMappingPromise
  slugMappingCache = result
  slugMappingPromise = null
  return result
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a slug from a school name.
 * This mimics the pattern used by the API for consistency.
 */
export function generateSlugFromName(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Map school name to slug.
 * Uses cached mapping file if available, falls back to generated slug.
 */
export async function getSchoolSlug(schoolName: string): Promise<string | null> {
  if (!schoolName || !schoolName.trim()) {
    return null
  }
  
  const mapping = await loadSlugMapping()
  const schoolLower = schoolName.toLowerCase().trim()
  
  // Try exact match
  if (mapping[schoolLower]) {
    return mapping[schoolLower]
  }
  
  // Try partial match (for cases like "North Carolina" matching "north carolina state")
  for (const [key, slug] of Object.entries(mapping)) {
    if (key.includes(schoolLower) || schoolLower.includes(key)) {
      return slug
    }
  }
  
  // Fallback to generated slug
  return generateSlugFromName(schoolName)
}

/**
 * Get logo URL for a school.
 * Uses local files from /team-logos/ directory.
 * 
 * @param schoolName - The school name to get logo for
 * @param dark - Whether to fetch dark mode variant (default: false)
 * @returns URL to the logo SVG, or null if slug cannot be determined
 */
export async function getLogoUrl(
  schoolName: string,
  dark: boolean = false
): Promise<string | null> {
  const slug = await getSchoolSlug(schoolName)
  if (!slug) {
    return null
  }

  const fileName = dark ? `${slug}-dark.svg` : `${slug}.svg`
  return `/team-logos/${fileName}`
}

/**
 * Get logo URL synchronously using a slug (for when you already have the slug).
 * Uses local files from /team-logos/ directory.
 * 
 * @param slug - The school slug
 * @param dark - Whether to fetch dark mode variant (default: false)
 * @returns URL to the logo SVG
 */
export function getLogoUrlBySlug(slug: string, dark: boolean = false): string {
  const fileName = dark ? `${slug}-dark.svg` : `${slug}.svg`
  return `/team-logos/${fileName}`
}

/**
 * Preload the slug mapping (call early in app lifecycle)
 */
export function preloadSlugMapping(): void {
  loadSlugMapping()
}
