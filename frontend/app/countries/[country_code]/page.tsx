import { notFound } from 'next/navigation'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import CountryPageClient from './CountryPageClient'

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

async function getCountryData(country_code: string): Promise<{ country: Country | null; similarCountries: Country[] }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

    // Fetch the specific country with analysis
    const countryResponse = await fetch(
      `${apiUrl}/regulations/${country_code.toUpperCase()}?include_analysis=true`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: { 'Accept': 'application/json' }
      }
    )

    if (!countryResponse.ok) {
      return { country: null, similarCountries: [] }
    }

    const country: Country = await countryResponse.json()

    // Fetch all countries for similar countries lookup
    const allCountriesResponse = await fetch(
      `${apiUrl}/regulations/?reliable_only=true`,
      {
        next: { revalidate: 600 }, // Cache for 10 min
        headers: { 'Accept': 'application/json' }
      }
    )

    let similarCountries: Country[] = []
    if (allCountriesResponse.ok) {
      const allCountries: Country[] = await allCountriesResponse.json()

      // Find similar countries based on tax rate
      const countryRate = country.crypto_short_rate ?? country.cgt_short_rate
      similarCountries = allCountries
        .filter(c => c.country_code !== country.country_code)
        .filter(c => {
          const rate = c.crypto_short_rate ?? c.cgt_short_rate
          return Math.abs(rate - countryRate) < 0.10 // Within 10% tax rate
        })
        .slice(0, 3)
    }

    return { country, similarCountries }
  } catch (error) {
    console.error('[SSR] Error fetching country:', error)
    return { country: null, similarCountries: [] }
  }
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ country_code: string }>
}) {
  const { country_code } = await params
  const { country, similarCountries } = await getCountryData(country_code)

  if (!country) {
    notFound()
  }

  return (
    <PublicPageSSR>
      <CountryPageClient
        initialCountry={country}
        initialSimilarCountries={similarCountries}
        countryCode={country_code}
      />
    </PublicPageSSR>
  )
}
