import { PublicPageSSR } from '@/components/PublicPageSSR'
import { Database, Download, Code, FileJson, Calendar, Shield } from 'lucide-react'

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  holding_period_months?: number
  is_territorial?: boolean
  exemption_threshold?: number
  ai_analysis?: string
}

async function getCountriesData(): Promise<Country[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const response = await fetch(`${apiUrl}/regulations?include_analysis=true`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Error fetching countries data:', error)
    return []
  }
}

export default async function DataPage() {
  const countries = await getCountriesData()
  const lastUpdated = new Date().toISOString()
  const publishedDate = '2025-01-01T00:00:00Z'

  // Generate Dataset JSON-LD for AI consumption
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://cryptonomadhub.io/data',
    name: 'Global Cryptocurrency Tax Regulations Database',
    description: 'Comprehensive dataset of cryptocurrency tax regulations for 167 countries worldwide, including capital gains rates, holding periods, legal status, and AI-powered analysis. Updated monthly with official government sources.',
    url: 'https://cryptonomadhub.io/data',
    sameAs: 'https://cryptonomadhub.io/countries',
    keywords: [
      'cryptocurrency tax',
      'crypto tax rates',
      'capital gains tax',
      'crypto regulations',
      'tax by country',
      'crypto legal status',
      'holding period',
      'territorial tax',
      'crypto tax data'
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creditText: 'CryptoNomadHub — sources: PwC Tax Summaries, OECD Tax Database, Deloitte International Tax Guides, Official Tax Authorities',
    citation: 'CryptoNomadHub (2025). Global Cryptocurrency Tax Regulations Database. https://cryptonomadhub.io/data',
    creator: {
      '@type': 'Organization',
      name: 'CryptoNomadHub',
      url: 'https://cryptonomadhub.io',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@cryptonomadhub.io',
        contactType: 'Customer Service'
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'Fractal Corp Limited',
      identifier: 'IBC 239950'
    },
    datePublished: publishedDate,
    dateModified: lastUpdated,
    temporalCoverage: '2025',
    spatialCoverage: {
      '@type': 'Place',
      name: 'Worldwide'
    },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://cryptonomadhub.io/tax-data.json',
        description: 'JSON format download'
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/ld+json',
        contentUrl: 'https://cryptonomadhub.io/data',
        description: 'Structured data on web page'
      }
    ],
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Short-term Capital Gains Rate',
        description: 'Tax rate for cryptocurrency held less than holding period',
        unitText: 'Percent'
      },
      {
        '@type': 'PropertyValue',
        name: 'Long-term Capital Gains Rate',
        description: 'Tax rate for cryptocurrency held longer than holding period',
        unitText: 'Percent'
      },
      {
        '@type': 'PropertyValue',
        name: 'Holding Period',
        description: 'Minimum holding period for long-term capital gains',
        unitText: 'Months'
      },
      {
        '@type': 'PropertyValue',
        name: 'Legal Status',
        description: 'Legal status of cryptocurrency in country',
        valueReference: ['legal', 'banned', 'restricted', 'unclear']
      }
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'CryptoNomadHub Tax Database',
      description: 'Tax and regulatory information for digital nomads and crypto investors'
    },
    numberOfRecords: countries.length,
    about: countries.slice(0, 10).map(country => ({
      '@type': 'Place',
      name: country.country_name,
      identifier: country.country_code,
      description: `${country.country_name} cryptocurrency tax: ${((country.crypto_short_rate ?? country.cgt_short_rate) * 100).toFixed(1)}% short-term, ${((country.crypto_long_rate ?? country.cgt_long_rate) * 100).toFixed(1)}% long-term`
    }))
  }

  return (
    <PublicPageSSR>
      {/* JSON-LD for AI consumption */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-6">
              <Database className="w-4 h-4" />
              Open Dataset • CC-BY-4.0 License
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Global Crypto Tax Database
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Comprehensive cryptocurrency tax regulations for <span className="font-bold text-cyan-600">{countries.length} countries</span>.
              Open dataset for research, AI training, and analysis.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-cyan-600 mb-2">{countries.length}</div>
                <div className="text-slate-600 dark:text-slate-400">Countries</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {countries.filter(c => (c.crypto_short_rate ?? c.cgt_short_rate) === 0).length}
                </div>
                <div className="text-slate-600 dark:text-slate-400">0% Tax Countries</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-emerald-600 mb-2">Updated Monthly</div>
                <div className="text-slate-600 dark:text-slate-400">Data Freshness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Download & API Section */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="bg-gradient-to-br from-cyan-50 to-violet-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Access the Data
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* JSON Download */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <FileJson className="w-5 h-5 text-cyan-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Download JSON
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Complete dataset in JSON format (updated hourly)
                    </p>
                    <a
                      href="/tax-data.json"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download tax-data.json
                    </a>
                  </div>
                </div>
              </div>

              {/* API Access */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Code className="w-5 h-5 text-violet-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      API Access
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Programmatic access via REST API
                    </p>
                    <code className="block bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                      GET {process.env.NEXT_PUBLIC_API_URL || 'https://api.cryptonomadhub.io'}/regulations
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* License */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-slate-900 dark:text-white font-medium mb-1">
                  CC-BY-4.0 License
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Free to use for research, AI training, and commercial purposes. Attribution required.
                  Citation: CryptoNomadHub (2025). Global Cryptocurrency Tax Regulations Database. https://cryptonomadhub.io/data
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
          </div>
        </div>

        {/* Data Table Preview */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Dataset Preview
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Country
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Code
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      Short-term Rate
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      Long-term Rate
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                      Holding Period
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                      Legal Status
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                      Territorial
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {countries.map((country) => {
                    const shortRate = ((country.crypto_short_rate ?? country.cgt_short_rate) * 100).toFixed(1)
                    const longRate = ((country.crypto_long_rate ?? country.cgt_long_rate) * 100).toFixed(1)
                    const shortRateNum = parseFloat(shortRate)
                    const longRateNum = parseFloat(longRate)

                    return (
                      <tr
                        key={country.country_code}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <a
                            href={`/countries/${country.country_code.toLowerCase()}`}
                            className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                            <span className="text-xl">{country.flag_emoji}</span>
                            <span>{country.country_name}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {country.country_code}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            shortRateNum === 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {shortRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            longRateNum === 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {longRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                          {country.holding_period_months ? `${country.holding_period_months}mo` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            country.crypto_legal_status === 'legal'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : country.crypto_legal_status === 'banned'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : country.crypto_legal_status === 'restricted'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {country.crypto_legal_status || 'unclear'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {country.is_territorial && (
                            <span className="inline-block w-2 h-2 rounded-full bg-cyan-500"></span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
            Showing all {countries.length} countries • Click any country for detailed analysis
          </p>
        </div>

        {/* Data Sources */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Data Sources & Methodology
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Official government tax authorities and financial regulators</li>
              <li>• OECD Tax Database and international tax treaties</li>
              <li>• PwC Tax Summaries and Deloitte International Tax Guides</li>
              <li>• Verified by AI analysis trained on official documentation</li>
              <li>• Updated monthly with regulatory changes and new legislation</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
              Disclaimer: This data is for informational purposes only and does not constitute financial or tax advice.
              Always consult with a qualified tax professional for your specific situation.
            </p>
          </div>
        </div>
      </div>
    </PublicPageSSR>
  )
}
