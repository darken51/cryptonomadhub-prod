import type { Metadata } from 'next'

// Types pour les données pays
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
}

// Fetch country data for metadata generation
async function getCountryData(country_code: string): Promise<Country | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations?include_analysis=true`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) return null

    const data: Country[] = await response.json()
    return data.find(c => c.country_code === country_code.toUpperCase()) || null
  } catch (error) {
    console.error(`Error fetching country ${country_code}:`, error)
    return null
  }
}

// Generate static params for all 167 countries
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations?reliable_only=true`)

    if (!response.ok) {
      // Fallback to static list if API fails
      const STATIC_COUNTRY_CODES = [
        'ae', 'pt', 'sg', 'de', 'ch', 'my', 'mt', 'bh', 'bm', 'ky', 'hk', 'pr', 'gi', 'ee', 'si',
        'us', 'gb', 'fr', 'es', 'it', 'nl', 'be', 'at', 'dk', 'se', 'no', 'fi', 'ie', 'lu',
        'jp', 'kr', 'au', 'nz', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe',
        'th', 'id', 'ph', 'vn', 'in', 'cn', 'tw', 'sa', 'tr', 'il', 'za', 'ng', 'ke'
      ]
      return STATIC_COUNTRY_CODES.map((code) => ({
        country_code: code
      }))
    }

    const data: Country[] = await response.json()
    return data.map((country) => ({
      country_code: country.country_code.toLowerCase()
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata dynamically based on real country data
export async function generateMetadata({ params }: { params: Promise<{ country_code: string }> }): Promise<Metadata> {
  const { country_code } = await params
  const country = await getCountryData(country_code)

  if (!country) {
    return {
      title: 'Country Not Found | CryptoNomadHub',
      description: 'Crypto tax information for this country is not available.'
    }
  }

  // Determine tax rate to display
  const shortRate = country.crypto_short_rate !== null && country.crypto_short_rate !== undefined
    ? country.crypto_short_rate
    : country.cgt_short_rate

  const longRate = country.crypto_long_rate !== null && country.crypto_long_rate !== undefined
    ? country.crypto_long_rate
    : country.cgt_long_rate

  // Build title suffix
  let titleSuffix = ''
  if (shortRate === 0) {
    titleSuffix = ' - 0% Crypto Tax Guide'
  } else if (country.holding_period_months) {
    titleSuffix = ` - ${country.holding_period_months} Month Holding Period`
  } else if (shortRate !== longRate) {
    titleSuffix = ` - ${shortRate}% Short / ${longRate}% Long Term`
  } else {
    titleSuffix = ` - ${shortRate}% Tax Rate`
  }

  // Build description
  let description = `Complete guide to ${country.country_name} crypto tax regulations 2025: `

  if (shortRate === 0 && longRate === 0) {
    description += `0% capital gains tax on cryptocurrency. Tax-free crypto trading and investments. `
  } else if (country.is_territorial) {
    description += `Territorial tax system. ${shortRate}% short-term, ${longRate}% long-term capital gains. `
  } else if (country.holding_period_months) {
    description += `${shortRate}% tax rate with ${country.holding_period_months}-month holding period for benefits. `
  } else {
    description += `${shortRate}% short-term, ${longRate}% long-term capital gains rates. `
  }

  description += `Official regulations, AI analysis, visa requirements, and digital nomad guide.`

  // Build keywords
  const countryKeywords = [
    `${country.country_name.toLowerCase()} crypto tax`,
    `${country.country_name.toLowerCase()} cryptocurrency tax`,
    `${country.country_name.toLowerCase()} bitcoin tax`,
    `crypto tax in ${country.country_name.toLowerCase()}`,
    `${country.country_name.toLowerCase()} crypto regulations`,
  ]

  if (shortRate === 0) {
    countryKeywords.push(
      `${country.country_name.toLowerCase()} 0% crypto tax`,
      `${country.country_name.toLowerCase()} tax free crypto`,
      `${country.country_name.toLowerCase()} crypto tax haven`
    )
  }

  if (country.is_territorial) {
    countryKeywords.push(`${country.country_name.toLowerCase()} territorial tax`)
  }

  if (country.country_code === 'AE') {
    countryKeywords.push('dubai crypto tax', 'uae crypto tax')
  } else if (country.country_code === 'PT') {
    countryKeywords.push('portugal crypto tax 2025', 'portugal crypto changes')
  } else if (country.country_code === 'SG') {
    countryKeywords.push('singapore crypto tax', 'singapore capital gains')
  }

  return {
    title: `${country.flag_emoji || ''} ${country.country_name} Crypto Tax 2025${titleSuffix} | CryptoNomadHub`,
    description,
    keywords: countryKeywords,

    openGraph: {
      title: `${country.flag_emoji || ''} ${country.country_name} Crypto Tax ${new Date().getFullYear()}`,
      description,
      url: `https://cryptonomadhub.io/countries/${country_code.toLowerCase()}`,
      type: 'article',
      images: [
        {
          url: `/og-country-${country_code.toLowerCase()}.png`,
          width: 1200,
          height: 630,
          alt: `${country.country_name} Crypto Tax Guide - ${shortRate}% Rate`
        }
      ]
    },

    twitter: {
      card: 'summary_large_image',
      title: `${country.flag_emoji || ''} ${country.country_name} Crypto Tax ${new Date().getFullYear()}`,
      description: `${shortRate}% crypto tax rate. ${country.crypto_legal_status === 'legal' ? 'Legal' : country.crypto_legal_status || 'Regulated'}. Complete tax guide.`,
      images: [`/og-country-${country_code.toLowerCase()}.png`],
      creator: '@CryptoNomadHub'
    },

    alternates: {
      canonical: `https://cryptonomadhub.io/countries/${country_code.toLowerCase()}`
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    }
  }
}

export default function CountryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
