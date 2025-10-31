import { NextResponse } from 'next/server'

// Force dynamic to avoid build timeouts when API is not accessible
export const dynamic = 'force-dynamic'
export const revalidate = 3600

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_notes?: string
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  holding_period_months?: number
  is_territorial?: boolean
  exemption_threshold?: number
  data_quality?: string
  data_sources?: string[]
  source_url?: string
  updated_at?: string
}

async function getCountriesData(): Promise<Country[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations`, {
      next: { revalidate: 3600 }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

export async function GET() {
  const countries = await getCountriesData()
  const lastModified = new Date().toUTCString()
  const etag = `"${Date.now()}-${countries.length}"`

  const data = {
    metadata: {
      title: 'Global Cryptocurrency Tax Regulations Database',
      version: '1.0',
      license: 'CC-BY-4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      publisher: 'CryptoNomadHub',
      dateModified: new Date().toISOString(),
      numberOfCountries: countries.length,
    },
    countries: countries.map((c) => ({
      country_code: c.country_code,
      country_name: c.country_name,
      flag_emoji: c.flag_emoji,
      tax_rates: {
        short_term: { rate: c.crypto_short_rate ?? c.cgt_short_rate, unit: 'percent' },
        long_term: { rate: c.crypto_long_rate ?? c.cgt_long_rate, unit: 'percent' }
      },
      holding_period_months: c.holding_period_months,
      legal_status: c.crypto_legal_status,
      is_territorial: c.is_territorial,
      data_quality: c.data_quality,
      sources: c.data_sources,
    }))
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'Last-Modified': lastModified,
      'ETag': etag,
    }
  })
}
