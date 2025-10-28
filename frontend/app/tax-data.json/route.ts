import { NextResponse } from 'next/server'

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
  exemption_threshold_currency?: string
  is_flat_tax?: boolean
  is_progressive?: boolean
  crypto_specific?: boolean
  long_term_discount_pct?: number
  data_quality?: 'high' | 'medium' | 'low' | 'unknown'
  data_sources?: string[]
  source_url?: string
  notes?: string
  updated_at?: string
}

// Fallback data when backend is unavailable
const FALLBACK_RESPONSE = {
  status: 'degraded',
  message: 'Backend temporarily unavailable. Showing cached/fallback data.',
  metadata: {
    title: 'Global Cryptocurrency Tax Regulations Database',
    version: '1.0',
    license: 'CC-BY-4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    publisher: 'CryptoNomadHub',
    publisherUrl: 'https://cryptonomadhub.io',
    contact: 'contact@cryptonomadhub.io',
    dateModified: new Date().toISOString(),
    attribution: 'CryptoNomadHub — sources: PwC, OECD, Deloitte, Official Tax Authorities',
    disclaimer: 'Backend service temporarily unavailable. Please try again later or visit https://cryptonomadhub.io/data'
  },
  countries: [],
  reason: 'backend_unavailable'
}

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations?include_analysis=true`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      signal: AbortSignal.timeout(10000) // 10s timeout
    })

    if (!response.ok) {
      console.warn(`Backend returned ${response.status}, returning fallback data`)
      return NextResponse.json(FALLBACK_RESPONSE, {
        status: 200, // Still return 200 with degraded status
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', // Shorter cache for errors
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    const countries: Country[] = await response.json()

    // Build comprehensive JSON structure for download
    const taxData = {
      metadata: {
        title: 'Global Cryptocurrency Tax Regulations Database',
        description: 'Comprehensive dataset of cryptocurrency tax regulations for 167 countries worldwide',
        version: '1.0',
        license: 'CC-BY-4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        publisher: 'CryptoNomadHub',
        publisherUrl: 'https://cryptonomadhub.io',
        contact: 'contact@cryptonomadhub.io',
        datePublished: '2025-01-01',
        dateModified: new Date().toISOString(),
        updateFrequency: 'Monthly',
        numberOfCountries: countries.length,
        attribution: 'CryptoNomadHub (2025). Global Cryptocurrency Tax Regulations Database. https://cryptonomadhub.io/data',
        sources: [
          'Official government tax authorities',
          'OECD Tax Database',
          'PwC Tax Summaries',
          'Deloitte International Tax Guides',
          'Verified legal documentation'
        ],
        disclaimer: 'This data is for informational purposes only and does not constitute financial, tax, or legal advice. Always consult with a qualified tax professional for your specific situation.'
      },
      countries: countries.map(country => ({
        country_code: country.country_code,
        country_name: country.country_name,
        flag_emoji: country.flag_emoji,
        tax_rates: {
          short_term: {
            rate: country.crypto_short_rate ?? country.cgt_short_rate,
            description: 'Tax rate for cryptocurrency held less than the holding period',
            unit: 'percent'
          },
          long_term: {
            rate: country.crypto_long_rate ?? country.cgt_long_rate,
            description: 'Tax rate for cryptocurrency held longer than the holding period',
            unit: 'percent'
          }
        },
        holding_period: {
          months: country.holding_period_months,
          description: 'Minimum holding period to qualify for long-term capital gains rate'
        },
        exemption_threshold: country.exemption_threshold ? {
          amount: country.exemption_threshold,
          currency: country.exemption_threshold_currency || 'USD',
          description: 'Annual exemption threshold before tax applies'
        } : null,
        tax_system: {
          is_territorial: country.is_territorial || false,
          is_flat_tax: country.is_flat_tax || false,
          is_progressive: country.is_progressive || false,
          crypto_specific: country.crypto_specific || false
        },
        legal_status: {
          status: country.crypto_legal_status || 'unclear',
          notes: country.crypto_notes
        },
        data_quality: {
          quality: country.data_quality || 'unknown',
          sources: country.data_sources || [],
          source_url: country.source_url,
          last_updated: country.updated_at
        },
        links: {
          detail_page: `https://cryptonomadhub.io/countries/${country.country_code.toLowerCase()}`,
          compare: `https://cryptonomadhub.io/features/multi-country-compare?countries=${country.country_code.toLowerCase()}`
        }
      })),
      statistics: {
        total_countries: countries.length,
        zero_tax_countries: countries.filter(c =>
          (c.crypto_short_rate ?? c.cgt_short_rate) === 0 &&
          (c.crypto_long_rate ?? c.cgt_long_rate) === 0
        ).length,
        territorial_countries: countries.filter(c => c.is_territorial).length,
        legal_countries: countries.filter(c => c.crypto_legal_status === 'legal').length,
        banned_countries: countries.filter(c => c.crypto_legal_status === 'banned').length,
        average_short_term_rate: Number((
          countries.reduce((sum, c) => sum + (c.crypto_short_rate ?? c.cgt_short_rate), 0) / countries.length
        ).toFixed(2)),
        average_long_term_rate: Number((
          countries.reduce((sum, c) => sum + (c.crypto_long_rate ?? c.cgt_long_rate), 0) / countries.length
        ).toFixed(2))
      }
    }

    return NextResponse.json(taxData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="cryptonomadhub-tax-data.json"',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })
  } catch (error) {
    console.error('Error generating tax-data.json:', error)
    // Return graceful degraded response instead of 500
    return NextResponse.json(FALLBACK_RESPONSE, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

// Enable static generation with revalidation
export const revalidate = 3600 // Revalidate every hour
