/**
 * Shared constants for the CryptoNomadHub application
 */

/**
 * Regional groupings for countries
 * Maps country codes (ISO 3166-1 alpha-2) to their geographical regions
 */
export const REGION_MAP: Record<string, string> = {
  // Europe
  'AD': 'Europe', 'AL': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'BG': 'Europe',
  'BA': 'Europe', 'BY': 'Europe', 'CH': 'Europe', 'CZ': 'Europe', 'DE': 'Europe',
  'DK': 'Europe', 'EE': 'Europe', 'ES': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
  'GB': 'Europe', 'GG': 'Europe', 'GI': 'Europe', 'GR': 'Europe', 'HR': 'Europe',
  'HU': 'Europe', 'IE': 'Europe', 'IS': 'Europe', 'IT': 'Europe', 'LI': 'Europe',
  'LT': 'Europe', 'LU': 'Europe', 'LV': 'Europe', 'MC': 'Europe', 'MD': 'Europe',
  'ME': 'Europe', 'MK': 'Europe', 'MT': 'Europe', 'NL': 'Europe', 'NO': 'Europe',
  'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe', 'RS': 'Europe', 'RU': 'Europe',
  'SE': 'Europe', 'SI': 'Europe', 'SK': 'Europe', 'UA': 'Europe', 'XK': 'Europe',

  // Americas
  'AR': 'Americas', 'BB': 'Americas', 'BO': 'Americas', 'BR': 'Americas',
  'CA': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'CR': 'Americas',
  'DO': 'Americas', 'EC': 'Americas', 'GT': 'Americas', 'GY': 'Americas',
  'HN': 'Americas', 'JM': 'Americas', 'MX': 'Americas', 'NI': 'Americas',
  'PA': 'Americas', 'PE': 'Americas', 'PR': 'Americas', 'PY': 'Americas',
  'SV': 'Americas', 'TT': 'Americas', 'US': 'Americas', 'UY': 'Americas',
  'VE': 'Americas',

  // Asia & Pacific
  'AU': 'Asia & Pacific', 'AZ': 'Asia & Pacific', 'BD': 'Asia & Pacific',
  'BN': 'Asia & Pacific', 'CN': 'Asia & Pacific', 'GE': 'Asia & Pacific',
  'HK': 'Asia & Pacific', 'ID': 'Asia & Pacific', 'IN': 'Asia & Pacific',
  'JP': 'Asia & Pacific', 'KH': 'Asia & Pacific', 'KR': 'Asia & Pacific',
  'KZ': 'Asia & Pacific', 'LA': 'Asia & Pacific', 'LK': 'Asia & Pacific',
  'MM': 'Asia & Pacific', 'MN': 'Asia & Pacific', 'MO': 'Asia & Pacific',
  'MW': 'Asia & Pacific', 'MY': 'Asia & Pacific', 'NZ': 'Asia & Pacific',
  'PG': 'Asia & Pacific', 'PH': 'Asia & Pacific', 'PK': 'Asia & Pacific',
  'PW': 'Asia & Pacific', 'SG': 'Asia & Pacific', 'TH': 'Asia & Pacific',
  'TL': 'Asia & Pacific', 'TW': 'Asia & Pacific', 'UZ': 'Asia & Pacific',
  'VN': 'Asia & Pacific',

  // Middle East & Africa
  'AE': 'Middle East & Africa', 'AM': 'Middle East & Africa', 'AO': 'Middle East & Africa',
  'BH': 'Middle East & Africa', 'BW': 'Middle East & Africa', 'CD': 'Middle East & Africa',
  'CG': 'Middle East & Africa', 'CI': 'Middle East & Africa', 'CM': 'Middle East & Africa',
  'CV': 'Middle East & Africa', 'DZ': 'Middle East & Africa', 'EG': 'Middle East & Africa',
  'ET': 'Middle East & Africa', 'GA': 'Middle East & Africa', 'GH': 'Middle East & Africa',
  'GQ': 'Middle East & Africa', 'IL': 'Middle East & Africa', 'IQ': 'Middle East & Africa',
  'JO': 'Middle East & Africa', 'KE': 'Middle East & Africa', 'KW': 'Middle East & Africa',
  'LB': 'Middle East & Africa', 'LR': 'Middle East & Africa', 'LY': 'Middle East & Africa',
  'MA': 'Middle East & Africa', 'MG': 'Middle East & Africa', 'MR': 'Middle East & Africa',
  'MU': 'Middle East & Africa', 'MZ': 'Middle East & Africa', 'NA': 'Middle East & Africa',
  'NG': 'Middle East & Africa', 'OM': 'Middle East & Africa', 'PS': 'Middle East & Africa',
  'QA': 'Middle East & Africa', 'RW': 'Middle East & Africa', 'SA': 'Middle East & Africa',
  'SC': 'Middle East & Africa', 'SN': 'Middle East & Africa', 'SZ': 'Middle East & Africa',
  'TD': 'Middle East & Africa', 'TN': 'Middle East & Africa', 'TR': 'Middle East & Africa',
  'TZ': 'Middle East & Africa', 'UG': 'Middle East & Africa', 'ZA': 'Middle East & Africa',
  'ZM': 'Middle East & Africa', 'ZW': 'Middle East & Africa',
}

/**
 * List of all regions
 */
export const REGIONS = [
  'Europe',
  'Americas',
  'Asia & Pacific',
  'Middle East & Africa',
  'Other'
] as const

/**
 * Get region for a country code
 */
export function getRegionForCountry(countryCode: string): string {
  return REGION_MAP[countryCode] || 'Other'
}

/**
 * Group countries by region
 */
export function groupCountriesByRegion<T extends { code: string }>(
  countries: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}

  countries.forEach(country => {
    const region = getRegionForCountry(country.code)
    if (!grouped[region]) {
      grouped[region] = []
    }
    grouped[region].push(country)
  })

  // Sort countries within each region alphabetically
  Object.keys(grouped).forEach(region => {
    grouped[region].sort((a, b) => {
      const nameA = 'name' in a ? String(a.name) : a.code
      const nameB = 'name' in b ? String(b.name) : b.code
      return nameA.localeCompare(nameB)
    })
  })

  return grouped
}
