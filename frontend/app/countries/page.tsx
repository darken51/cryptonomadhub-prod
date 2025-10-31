import { Metadata } from 'next'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import CountriesClient from './CountriesClient'

// Use ISR (Incremental Static Regeneration) for better performance
export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: '167 Countries Crypto Tax Database | 43 with 0% Tax',
  description: 'Compare crypto tax rates across 167 countries. Interactive map showing zero-tax crypto havens including UAE, Portugal, Singapore, Germany. Filter by tax rate, legal status, and AI country scores.',
  keywords: [
    'crypto tax by country',
    '0% crypto tax countries',
    'best countries for crypto',
    'UAE crypto tax',
    'Portugal crypto tax',
    'Singapore crypto tax',
    'Germany holding period',
    'tax-free crypto countries',
    'crypto legal status',
    'capital gains tax crypto worldwide'
  ],
  openGraph: {
    title: '167 Countries Crypto Tax Database | 43 with 0% Tax',
    description: 'Interactive world map of crypto tax rates. Find tax-free crypto jurisdictions, compare regulations, and see AI country scores.',
    images: ['/og-countries.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '167 Countries Crypto Tax Database',
    description: 'Interactive map: 43 countries with zero capital gains tax on crypto. Compare UAE, Portugal, Singapore, and more.',
    images: ['/og-countries.png'],
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/countries',
  },
}

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
  source_url?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_notes?: string
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  notes?: string
  data_quality?: 'high' | 'medium' | 'low' | 'unknown'
  data_sources?: string[]
  updated_at?: string
  holding_period_months?: number
  is_flat_tax?: boolean
  is_progressive?: boolean
  is_territorial?: boolean
  crypto_specific?: boolean
  long_term_discount_pct?: number
  exemption_threshold?: number
  exemption_threshold_currency?: string
  ai_analysis?: AIAnalysis
}

// Minimal static fallback data for SSR (ensures Google sees content even if API fails)
// NOTE: All rates stored as decimals (0.30 = 30%), NOT percentages
const STATIC_FALLBACK_COUNTRIES: Country[] = [
  { country_code: 'AE', country_name: 'United Arab Emirates', flag_emoji: '🇦🇪', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'PT', country_name: 'Portugal', flag_emoji: '🇵🇹', cgt_short_rate: 0.28, cgt_long_rate: 0, crypto_short_rate: 0.28, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'SG', country_name: 'Singapore', flag_emoji: '🇸🇬', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'DE', country_name: 'Germany', flag_emoji: '🇩🇪', cgt_short_rate: 0.45, cgt_long_rate: 0, crypto_short_rate: 0.45, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high', holding_period_months: 12 },
  { country_code: 'CH', country_name: 'Switzerland', flag_emoji: '🇨🇭', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'MY', country_name: 'Malaysia', flag_emoji: '🇲🇾', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'medium' },
  { country_code: 'MT', country_name: 'Malta', flag_emoji: '🇲🇹', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'BH', country_name: 'Bahrain', flag_emoji: '🇧🇭', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'medium' },
  { country_code: 'HK', country_name: 'Hong Kong', flag_emoji: '🇭🇰', cgt_short_rate: 0, cgt_long_rate: 0, crypto_short_rate: 0, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'EE', country_name: 'Estonia', flag_emoji: '🇪🇪', cgt_short_rate: 0.20, cgt_long_rate: 0, crypto_short_rate: 0.20, crypto_long_rate: 0, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'US', country_name: 'United States', flag_emoji: '🇺🇸', cgt_short_rate: 0.37, cgt_long_rate: 0.20, crypto_short_rate: 0.37, crypto_long_rate: 0.20, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'GB', country_name: 'United Kingdom', flag_emoji: '🇬🇧', cgt_short_rate: 0.24, cgt_long_rate: 0.24, crypto_short_rate: 0.24, crypto_long_rate: 0.24, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'FR', country_name: 'France', flag_emoji: '🇫🇷', cgt_short_rate: 0.30, cgt_long_rate: 0.30, crypto_short_rate: 0.30, crypto_long_rate: 0.30, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'ES', country_name: 'Spain', flag_emoji: '🇪🇸', cgt_short_rate: 0.28, cgt_long_rate: 0.28, crypto_short_rate: 0.28, crypto_long_rate: 0.28, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'IT', country_name: 'Italy', flag_emoji: '🇮🇹', cgt_short_rate: 0.26, cgt_long_rate: 0.26, crypto_short_rate: 0.26, crypto_long_rate: 0.26, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'JP', country_name: 'Japan', flag_emoji: '🇯🇵', cgt_short_rate: 0.55, cgt_long_rate: 0.55, crypto_short_rate: 0.55, crypto_long_rate: 0.55, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'AU', country_name: 'Australia', flag_emoji: '🇦🇺', cgt_short_rate: 0.47, cgt_long_rate: 0.235, crypto_short_rate: 0.47, crypto_long_rate: 0.235, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'CA', country_name: 'Canada', flag_emoji: '🇨🇦', cgt_short_rate: 0.27, cgt_long_rate: 0.135, crypto_short_rate: 0.27, crypto_long_rate: 0.135, crypto_legal_status: 'legal', data_quality: 'high' },
  { country_code: 'BR', country_name: 'Brazil', flag_emoji: '🇧🇷', cgt_short_rate: 0.175, cgt_long_rate: 0.175, crypto_short_rate: 0.175, crypto_long_rate: 0.175, crypto_legal_status: 'legal', data_quality: 'medium' },
  { country_code: 'MX', country_name: 'Mexico', flag_emoji: '🇲🇽', cgt_short_rate: 0.35, cgt_long_rate: 0.35, crypto_short_rate: 0.35, crypto_long_rate: 0.35, crypto_legal_status: 'legal', data_quality: 'medium' },
]

async function getCountries(): Promise<Country[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const url = `${apiUrl}/regulations/?reliable_only=true&include_analysis=true`

    console.log('[SSR] Fetching countries from:', url)

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('[SSR] API failed:', response.status, '- Using static fallback (20 countries)')
      return STATIC_FALLBACK_COUNTRIES
    }

    const data = await response.json()
    console.log('[SSR] Successfully fetched', data.length, 'countries')

    // If API returns empty, use fallback
    if (!data || data.length === 0) {
      console.warn('[SSR] API returned empty data - Using static fallback')
      return STATIC_FALLBACK_COUNTRIES
    }

    return data.sort((a: Country, b: Country) => a.country_name.localeCompare(b.country_name))
  } catch (error) {
    console.error('[SSR] Error fetching countries:', error, '- Using static fallback')
    return STATIC_FALLBACK_COUNTRIES
  }
}

export default async function CountriesPage() {
  const countries = await getCountries()

  // Top 15 crypto-friendly countries for ItemList
  const top15Countries = [
    { code: 'AE', name: 'United Arab Emirates', rate: '0%', flag: '🇦🇪' },
    { code: 'PT', name: 'Portugal', rate: '0%', flag: '🇵🇹' },
    { code: 'SG', name: 'Singapore', rate: '0%', flag: '🇸🇬' },
    { code: 'DE', name: 'Germany', rate: '0%*', flag: '🇩🇪' },
    { code: 'CH', name: 'Switzerland', rate: '0%*', flag: '🇨🇭' },
    { code: 'MY', name: 'Malaysia', rate: '0%', flag: '🇲🇾' },
    { code: 'MT', name: 'Malta', rate: '0%', flag: '🇲🇹' },
    { code: 'BH', name: 'Bahrain', rate: '0%', flag: '🇧🇭' },
    { code: 'BM', name: 'Bermuda', rate: '0%', flag: '🇧🇲' },
    { code: 'KY', name: 'Cayman Islands', rate: '0%', flag: '🇰🇾' },
    { code: 'HK', name: 'Hong Kong', rate: '0%', flag: '🇭🇰' },
    { code: 'PR', name: 'Puerto Rico', rate: '0-4%', flag: '🇵🇷' },
    { code: 'GI', name: 'Gibraltar', rate: '0%', flag: '🇬🇮' },
    { code: 'EE', name: 'Estonia', rate: '0-20%', flag: '🇪🇪' },
    { code: 'SI', name: 'Slovenia', rate: '0%*', flag: '🇸🇮' }
  ]

  return (
    <PublicPageSSR contentClassName="bg-slate-50 dark:bg-slate-900 py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Crypto Tax Rates by Country",
            "description": "Comprehensive database of cryptocurrency taxation rates across 167 countries, including capital gains tax, crypto-specific regulations, and legal status.",
            "url": "https://cryptonomadhub.io/countries",
            "keywords": ["crypto tax", "cryptocurrency taxation", "capital gains tax", "bitcoin tax", "ethereum tax", "international tax rates"],
            "creator": {
              "@type": "Organization",
              "name": "CryptoNomadHub",
              "url": "https://cryptonomadhub.io"
            },
            "distribution": {
              "@type": "DataDownload",
              "encodingFormat": "application/json",
              "contentUrl": "https://cryptonomadhub.io/countries"
            },
            "temporalCoverage": "2024/2025",
            "spatialCoverage": {
              "@type": "Place",
              "name": "Worldwide"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Top 15 Crypto-Friendly Countries - 0% Tax Jurisdictions",
            "description": "Best countries for cryptocurrency investors with 0% or minimal capital gains tax on crypto.",
            "numberOfItems": 15,
            "itemListElement": top15Countries.map((country, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Place",
                "name": `${country.flag} ${country.name}`,
                "description": `Crypto tax rate: ${country.rate}`,
                "url": `https://cryptonomadhub.io/countries/${country.code.toLowerCase()}`
              }
            }))
          })
        }}
      />
      <CountriesClient initialCountries={countries} />
    </PublicPageSSR>
  )
}
