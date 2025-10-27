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
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Dynamic country detail pages
  const countryPages: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/countries/${country.country_code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...countryPages]
}
