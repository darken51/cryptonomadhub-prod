interface AIAnalysis {
  crypto_score: number
  nomad_score: number
  overall_score: number
  crypto_analysis: string
  nomad_analysis: string
  key_advantages: string[]
  key_disadvantages: string[]
  best_for: string[]
  crypto_score_breakdown: {
    tax_favorability: number
    legal_clarity: number
    crypto_adoption: number
    innovation_ecosystem: number
  }
  nomad_score_breakdown: {
    cost_of_living: number
    visa_accessibility: number
    infrastructure: number
    expat_community: number
  }
  generated_at: string
  expires_at: string
  confidence: number
  is_expired: boolean
}

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  ai_analysis?: AIAnalysis
  crypto_short_rate?: number
  crypto_long_rate?: number
  cgt_short_rate?: number
  cgt_long_rate?: number
  crypto_notes?: string
  [key: string]: any
}

export interface PodiumBadge {
  category: 'overall' | 'crypto' | 'nomad'
  position: number // 0 = gold, 1 = silver, 2 = bronze
  medal: string
}

export interface CountryWithBadges extends Country {
  badges: PodiumBadge[]
}

/**
 * Extract top 3 countries for each category
 */
export function getTopCountriesByCategory(
  countries: Country[],
  category: 'crypto' | 'nomad' | 'overall'
): Country[] {
  return countries
    .filter(c => c.ai_analysis)
    .map(c => ({
      ...c,
      score: category === 'crypto'
        ? c.ai_analysis!.crypto_score
        : category === 'nomad'
        ? c.ai_analysis!.nomad_score
        : Math.round((c.ai_analysis!.crypto_score + c.ai_analysis!.nomad_score) / 2)
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3)
}

/**
 * Extract unique countries from all podiums with their badges
 */
export function getPodiumCountriesWithBadges(countries: Country[]): CountryWithBadges[] {
  const topCrypto = getTopCountriesByCategory(countries, 'crypto')
  const topNomad = getTopCountriesByCategory(countries, 'nomad')
  const topOverall = getTopCountriesByCategory(countries, 'overall')

  // Map to track countries and their badges
  const countryBadgesMap = new Map<string, PodiumBadge[]>()

  const addBadge = (country: Country, category: 'overall' | 'crypto' | 'nomad', position: number) => {
    const code = country.country_code
    if (!countryBadgesMap.has(code)) {
      countryBadgesMap.set(code, [])
    }
    countryBadgesMap.get(code)!.push({
      category,
      position,
      medal: position === 0 ? '🥇' : position === 1 ? '🥈' : '🥉'
    })
  }

  // Add badges for each podium
  topOverall.forEach((country, idx) => addBadge(country, 'overall', idx))
  topCrypto.forEach((country, idx) => addBadge(country, 'crypto', idx))
  topNomad.forEach((country, idx) => addBadge(country, 'nomad', idx))

  // Create array of unique countries with their badges
  const uniqueCountries: CountryWithBadges[] = []
  const addedCodes = new Set<string>()

  const addCountry = (country: Country) => {
    if (!addedCodes.has(country.country_code)) {
      uniqueCountries.push({
        ...country,
        badges: countryBadgesMap.get(country.country_code) || []
      })
      addedCodes.add(country.country_code)
    }
  }

  // Add in order: Overall top 3, then Crypto top 3, then Nomad top 3
  topOverall.forEach(addCountry)
  topCrypto.forEach(addCountry)
  topNomad.forEach(addCountry)

  return uniqueCountries
}

/**
 * Get medal emoji
 */
export function getMedalEmoji(position: number): string {
  if (position === 0) return '🥇'
  if (position === 1) return '🥈'
  return '🥉'
}

/**
 * Get position number (1st, 2nd, 3rd)
 */
export function getPositionText(position: number): string {
  return `#${position + 1}`
}

/**
 * Get category label
 */
export function getCategoryLabel(category: 'overall' | 'crypto' | 'nomad'): string {
  if (category === 'overall') return 'Overall'
  if (category === 'crypto') return 'Crypto'
  return 'Nomad'
}
