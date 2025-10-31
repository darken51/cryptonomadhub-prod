'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Build timestamp: 2025-10-30 17:00 - Force rebuild v3

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, AlertCircle, CheckCircle2, XCircle, TrendingDown, Info } from 'lucide-react'
import CountryScoreCard from '@/components/CountryScoreCard'
import CountryFAQ from '@/components/CountryFAQ'

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

export default function CountryDetailPage() {
  const params = useParams()
  const country_code = params?.country_code as string
  const [country, setCountry] = useState<Country | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarCountries, setSimilarCountries] = useState<Country[]>([])

  useEffect(() => {
    if (country_code) {
      fetchCountryData()
    }
  }, [country_code])

  const fetchCountryData = async () => {
    try {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

      // ✅ PERFORMANCE OPTIMIZATION (v2):
      // 1. Fetch ONLY the requested country via /regulations/{code} (not all 167 countries)
      // 2. Use cached list for similar countries lookup (10min TTL)

      // Fetch the specific country with analysis (optimized endpoint)
      console.log('🚀 OPTIMIZED: Fetching single country:', country_code.toUpperCase())
      const countryResponse = await fetch(
        `${apiUrl}/regulations/${country_code.toUpperCase()}?include_analysis=true`
      )

      if (!countryResponse.ok) {
        if (countryResponse.status === 404) {
          setError('Country not found')
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch country data')
      }

      const foundCountry: Country = await countryResponse.json()
      setCountry(foundCountry)

      // ✅ For similar countries: use cached all-countries data if available
      const cacheKey = 'countries_reliable_list'
      const cacheTTL = 10 * 60 * 1000 // 10 minutes
      const cached = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(cacheKey + '_time')

      let allCountries: Country[]

      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < cacheTTL) {
        // Use cached list for similar countries
        allCountries = JSON.parse(cached)
      } else {
        // Fetch reliable countries list (smaller, without full analysis)
        const listResponse = await fetch(`${apiUrl}/regulations/?reliable_only=true`)
        if (listResponse.ok) {
          allCountries = await listResponse.json()
          localStorage.setItem(cacheKey, JSON.stringify(allCountries))
          localStorage.setItem(cacheKey + '_time', Date.now().toString())
        } else {
          allCountries = []
        }
      }

      // Find similar countries based on crypto tax rate
      const currentRate = foundCountry.crypto_short_rate ?? foundCountry.cgt_short_rate
      const otherCountries = allCountries
        .filter(c => c.country_code !== foundCountry.country_code && c.crypto_legal_status !== 'banned')
        .map(c => ({
          ...c,
          taxDiff: Math.abs((c.crypto_short_rate ?? c.cgt_short_rate) - currentRate)
        }))
        .sort((a, b) => a.taxDiff - b.taxDiff)
        .slice(0, 3)

      setSimilarCountries(otherCountries)
    } catch (err) {
      console.error('Error fetching country:', err)
      setError('Failed to load country data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isCryptoBanned = (country: Country) => {
    return country.crypto_legal_status === 'banned'
  }

  const getLegalStatusBadge = (status?: string) => {
    const badges = {
      legal: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '✓ Legal', icon: CheckCircle2 },
      banned: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: '✗ Banned', icon: XCircle },
      restricted: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '⚠ Restricted', icon: AlertCircle },
      unclear: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: '? Unclear', icon: AlertCircle }
    }

    const badge = badges[status as keyof typeof badges]
    if (!badge) return null

    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  const getDataQualityBadge = (quality?: string) => {
    const badges = {
      high: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'High Quality' },
      medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Medium Quality' },
      low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'Limited Quality' },
      unknown: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', label: 'Unknown' }
    }

    const badge = badges[quality as keyof typeof badges]
    if (!badge) return null

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Countries
          </Link>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
              {error || 'Country Not Found'}
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-6">
              The country code "{country_code?.toUpperCase()}" could not be found in our database.
            </p>
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors"
            >
              View All Countries
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      {/* BreadcrumbList JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://cryptonomadhub.io"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Countries",
                "item": "https://cryptonomadhub.io/countries"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": country.country_name,
                "item": `https://cryptonomadhub.io/countries/${country_code.toLowerCase()}`
              }
            ]
          })
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
          <Link
            href="/"
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/countries"
            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Countries
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {country.country_name}
          </span>
        </nav>

        {/* Main Content */}
        <>
          {/* Country Header */}
          <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-4 mb-4">
            {country.flag_emoji && (
              <span className="text-6xl" role="img" aria-label={`${country.country_name} flag`}>{country.flag_emoji}</span>
            )}
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                {country.country_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg text-slate-500 dark:text-slate-400 font-mono">
                  {country.country_code}
                </span>
                {getLegalStatusBadge(country.crypto_legal_status)}
                {getDataQualityBadge(country.data_quality)}
              </div>
              {/* Last Updated Badge */}
              {country.updated_at && (
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: {formatDate(country.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* BANNED Warning */}
        {isCryptoBanned(country) && (
          <motion.div
            className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                  Cryptocurrency is BANNED in this country
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Trading, holding, or transacting with cryptocurrency may be illegal and subject to severe penalties.
                  The tax rates shown below are not applicable as crypto activities are prohibited by law.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Analysis */}
        {country.ai_analysis && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CountryScoreCard analysis={country.ai_analysis} defaultExpanded={true} />
          </motion.div>
        )}

        {/* Tax Information */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-violet-600" />
            Tax Rates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crypto-Specific Rates */}
            {(country.crypto_short_rate !== undefined || country.crypto_long_rate !== undefined) && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">
                  🪙 Crypto-Specific Rates
                </h3>
                <div className="space-y-3">
                  {country.crypto_short_rate !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Short-term:</span>
                      <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {(country.crypto_short_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {country.crypto_long_rate !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Long-term:</span>
                      <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {(country.crypto_long_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Capital Gains */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                📊 General Capital Gains
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Short-term:</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {(country.cgt_short_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Long-term:</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {(country.cgt_long_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Tax Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {country.holding_period_months != null && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Holding Period</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {country.holding_period_months} months
                </div>
              </div>
            )}
            {country.long_term_discount_pct != null && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">LT Discount</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {country.long_term_discount_pct}%
                </div>
              </div>
            )}
            {country.exemption_threshold != null && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Exemption Threshold</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {country.exemption_threshold.toLocaleString()} {country.exemption_threshold_currency || ''}
                </div>
              </div>
            )}
          </div>

          {/* Tax System Badges */}
          {(country.is_flat_tax || country.is_progressive || country.is_territorial) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {country.is_flat_tax && (
                <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
                  Flat Tax System
                </span>
              )}
              {country.is_progressive && (
                <span className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg">
                  Progressive Tax System
                </span>
              )}
              {country.is_territorial && (
                <span className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg">
                  Territorial Tax System
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Notes & Sources */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Crypto Notes */}
          {country.crypto_notes && (
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-6 border border-violet-200 dark:border-violet-800">
              <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-200 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Crypto-Specific Notes
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {country.crypto_notes}
              </p>
            </div>
          )}

          {/* General Notes */}
          {country.notes && (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Additional Notes
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {country.notes}
              </p>
            </div>
          )}

          {/* Official Source */}
          {country.source_url && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Official Source
              </h3>
              <a
                href={country.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                {country.source_url}
              </a>
            </div>
          )}

          {/* Last Updated */}
          {country.updated_at && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {formatDate(country.updated_at)}</span>
            </div>
          )}
        </motion.div>

        {/* Compare with Similar Countries - Internal Linking for SEO */}
        {similarCountries.length > 0 && (
          <motion.div
            className="mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                🔄 Compare with Similar Countries
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Countries with comparable crypto tax rates to {country.country_name}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarCountries.map((similar) => {
                  const rate = similar.crypto_short_rate ?? similar.cgt_short_rate
                  return (
                    <Link
                      key={similar.country_code}
                      href={`/countries/${similar.country_code.toLowerCase()}`}
                      className="group"
                    >
                      <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 transition-colors bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center gap-3 mb-2">
                          {similar.flag_emoji && <span className="text-3xl" role="img" aria-label={`${similar.country_name} flag`}>{similar.flag_emoji}</span>}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {similar.country_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{similar.country_code}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{(rate * 100).toFixed(1)}%</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">crypto tax</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQs Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CountryFAQ country={country} />
        </motion.div>

        {/* Data Sources & Disclaimer */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Data Sources & Methodology
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong>Sources:</strong> Official government tax authorities ({country.country_name} tax agency),
                OECD Tax Database, PwC Tax Summaries, Deloitte International Tax Guides, and verified legal documentation.
              </p>
              <p>
                <strong>AI Analysis:</strong> Powered by CryptoNomadHub AI and trained on official tax documentation,
                government publications, and international tax treaties. Analysis confidence: {country.ai_analysis ? `${Math.round(country.ai_analysis.confidence * 100)}%` : 'N/A'}.
              </p>
              <p>
                <strong>Last Updated:</strong> {country.updated_at ? formatDate(country.updated_at) : 'October 2025'} •
                Data refreshed monthly with regulatory changes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-300 dark:border-slate-600">
                <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute
                financial, tax, or legal advice. Tax laws change frequently. Always consult with a qualified tax
                professional in {country.country_name} for advice specific to your situation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA to Tools */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/tools">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl p-[2px] hover:shadow-lg transition-shadow">
              <div className="bg-white dark:bg-slate-800 rounded-[10px] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      💡 Recommended Tools for Crypto Nomads
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Crypto cards, digital residencies, and essential services to manage your assets as a nomad
                    </p>
                  </div>
                  <ArrowLeft className="w-6 h-6 text-violet-600 transform rotate-180 flex-shrink-0" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
        </>
      </div>
    </div>
  )
}
