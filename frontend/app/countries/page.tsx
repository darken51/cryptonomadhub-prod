import { PublicPageLayout } from '@/components/PublicPageLayout'
import CountriesClient from './CountriesClient'

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

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      console.error('Failed to fetch countries:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.sort((a: Country, b: Country) => a.country_name.localeCompare(b.country_name))
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

export default async function CountriesPage() {
  const countries = await getCountries()

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
            "url": "https://cryptonomadhub.com/countries",
            "keywords": ["crypto tax", "cryptocurrency taxation", "capital gains tax", "bitcoin tax", "ethereum tax", "international tax rates"],
            "creator": {
              "@type": "Organization",
              "name": "CryptoNomadHub",
              "url": "https://cryptonomadhub.com"
            },
            "distribution": {
              "@type": "DataDownload",
              "encodingFormat": "application/json",
              "contentUrl": "https://cryptonomadhub.com/countries"
            },
            "temporalCoverage": "2024/2025",
            "spatialCoverage": {
              "@type": "Place",
              "name": "Worldwide"
            }
          })
        }}
      />
      <CountriesClient initialCountries={countries} />
    </PublicPageLayout>
  )
}
