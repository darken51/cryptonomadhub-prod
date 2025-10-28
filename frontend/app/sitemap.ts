import { MetadataRoute } from 'next'

interface Country {
  country_code: string
}

// Fallback static list of top countries for sitemap (in case API fails)
const STATIC_COUNTRY_CODES = [
  'ae', 'pt', 'sg', 'de', 'ch', 'my', 'mt', 'bh', 'bm', 'ky', 'hk', 'pr', 'gi', 'ee', 'si',
  'us', 'gb', 'fr', 'es', 'it', 'nl', 'be', 'at', 'dk', 'se', 'no', 'fi', 'ie', 'lu',
  'jp', 'kr', 'au', 'nz', 'ca', 'mx', 'br', 'ar', 'cl', 'co', 'pe',
  'th', 'id', 'ph', 'vn', 'in', 'cn', 'tw', 'ae', 'sa', 'tr', 'il', 'za', 'ng', 'ke'
]

async function getCountries(): Promise<Country[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('[Sitemap] Fetching countries from:', apiUrl)

    const response = await fetch(`${apiUrl}/regulations/?reliable_only=true`, {
      next: { revalidate: 86400 }, // Revalidate daily
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('[Sitemap] API failed:', response.status, 'Using static fallback')
      return STATIC_COUNTRY_CODES.map(code => ({ country_code: code.toUpperCase() }))
    }

    const data = await response.json()
    console.log('[Sitemap] Fetched', data.length, 'countries')
    return data
  } catch (error) {
    console.error('[Sitemap] Error:', error, '- Using static fallback')
    return STATIC_COUNTRY_CODES.map(code => ({ country_code: code.toUpperCase() }))
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptonomadhub.io'
  const countries = await getCountries()

  // Main static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/countries`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/portugal-crypto-tax-2025`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/uae-vs-singapore-comparison`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/tax-loss-harvesting-guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/solana-defi-taxes-explained`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/183-day-rule-tax-residency`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/germany-crypto-tax-changes-2025`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/fifo-lifo-hifo-comparison`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/best-crypto-countries-2025`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/wash-sale-rule-crypto`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/us-citizens-abroad-crypto-tax`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/nft-taxes-guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/cyprus-crypto-tax-eu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Solutions pages
  const solutionPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/solutions/nomads`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/solutions/traders`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/solutions/accountants`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Features pages
  const featurePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/features/countries`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/ai-scoring`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/multi-country-compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/ai-chat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/defi-audit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/wallet-portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/cost-basis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/tax-optimizer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Docs pages
  const docPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/ai-country-scoring`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/connect-wallet`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/cost-basis-methods`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/first-defi-audit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/wash-sale-detection`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Data pages (for AI crawlers and open data)
  const dataPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/data`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tax-data.json`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // Legal & Help pages
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  // Dynamic country detail pages
  const countryPages: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/countries/${country.country_code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages, ...solutionPages, ...featurePages, ...docPages, ...dataPages, ...legalPages, ...countryPages]
}
