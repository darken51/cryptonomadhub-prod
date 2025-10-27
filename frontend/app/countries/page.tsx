import { PublicPageLayout } from '@/components/PublicPageLayout'
import CountriesClient from './CountriesClient'

// Force dynamic rendering to ensure API is called at request time, not build time
export const dynamic = 'force-dynamic'

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

async function getCountries(): Promise<Country[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const url = `${apiUrl}/regulations/?reliable_only=true&include_analysis=true`

    console.log('[SSR] Fetching countries from:', url)

    const response = await fetch(url, {
      cache: 'no-store' // Always fetch fresh data for SSR
    })

    if (!response.ok) {
      console.error('[SSR] Failed to fetch countries:', response.status, response.statusText)
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    console.log('[SSR] Successfully fetched', data.length, 'countries')
    return data.sort((a: Country, b: Country) => a.country_name.localeCompare(b.country_name))
  } catch (error) {
    console.error('[SSR] Error fetching countries:', error)
    // Return empty array but log the error clearly
    return []
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
    <PublicPageLayout contentClassName="bg-slate-50 dark:bg-slate-900 py-4 sm:py-8">
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
    </PublicPageLayout>
  )
}
