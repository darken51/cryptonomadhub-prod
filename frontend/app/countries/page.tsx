'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { AppHeader } from '@/components/AppHeader'
import { ArrowLeft, Search, TrendingDown, Info } from 'lucide-react'
import WorldTaxMap from '@/components/WorldTaxMap'
import CountryScoreCard from '@/components/CountryScoreCard'
import TopCountriesPodium from '@/components/TopCountriesPodium'

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

  // Structured crypto tax metadata
  holding_period_months?: number
  is_flat_tax?: boolean
  is_progressive?: boolean
  is_territorial?: boolean
  crypto_specific?: boolean
  long_term_discount_pct?: number
  exemption_threshold?: number
  exemption_threshold_currency?: string

  // AI Analysis
  ai_analysis?: AIAnalysis
}

export default function CountriesPage() {
  const { token } = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'crypto-friendly' | 'has-crypto-data'>('all')
  const [reliableOnly, setReliableOnly] = useState(true)  // Show reliable data by default
  const [hideBannedCountries, setHideBannedCountries] = useState(false)  // Option to hide banned countries
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const isRecentlyUpdated = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // Memoize fetchCountries to prevent unnecessary re-creation
  const fetchCountries = useCallback(async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/regulations/?reliable_only=${reliableOnly}&include_analysis=true`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCountries(data.sort((a: Country, b: Country) => a.country_name.localeCompare(b.country_name)))
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [reliableOnly])

  const isCryptoBanned = useCallback((country: Country): boolean => {
    // Check crypto_legal_status first, then fall back to legacy checks
    if (country.crypto_legal_status === 'banned') return true
    return country.cgt_short_rate < 0 || (country.notes?.includes('🚫 BANNED') ?? false)
  }, [])

  // Memoize filterCountries to prevent unnecessary re-creation
  const filterCountries = useCallback(() => {
    let filtered = countries

    // Hide banned countries if option enabled
    if (hideBannedCountries) {
      filtered = filtered.filter(c => !isCryptoBanned(c))
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType === 'crypto-friendly') {
      // Countries with crypto rates < 10% (exclude banned)
      filtered = filtered.filter(c =>
        !isCryptoBanned(c) && (
          (c.crypto_long_rate && c.crypto_long_rate < 0.10) ||
          (c.cgt_long_rate < 0.10 && c.cgt_long_rate >= 0)
        )
      )
    } else if (filterType === 'has-crypto-data') {
      // Countries with crypto-specific data
      filtered = filtered.filter(c => c.crypto_short_rate !== null && c.crypto_short_rate !== undefined)
    }

    setFilteredCountries(filtered)
  }, [countries, searchQuery, filterType, hideBannedCountries, isCryptoBanned])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  useEffect(() => {
    filterCountries()
  }, [filterCountries])

  const getCryptoBannedBadge = (country: Country) => {
    if (isCryptoBanned(country)) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
          <span className="text-base">🚫</span>
          CRYPTO BANNED
        </span>
      )
    }
    return null
  }

  const getCryptoFriendlyBadge = (country: Country) => {
    // Don't show friendly badge if crypto is banned
    if (isCryptoBanned(country)) return null

    const cryptoRate = country.crypto_long_rate ?? country.cgt_long_rate
    if (cryptoRate === 0) {
      return <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full">0% Tax</span>
    } else if (cryptoRate < 0.10) {
      return <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-full">Low Tax</span>
    }
    return null
  }

  const getDataQualityBadge = (quality?: string) => {
    if (!quality) return null

    const badges = {
      high: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        label: 'Verified'
      },
      medium: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Partial'
      },
      low: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        label: 'Limited'
      },
      unknown: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-500 dark:text-gray-400',
        label: 'Unknown'
      }
    }

    const badge = badges[quality as keyof typeof badges]
    if (!badge) return null

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {badge.label}
      </span>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
              Country Tax Regulations
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Browse crypto tax rates for {countries.length}+ countries with verified data and real-time updates
            </p>
          </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search Countries
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or code..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-900 dark:text-white transition-all"
              >
                <option value="all">All Countries ({countries.length})</option>
                <option value="crypto-friendly">Crypto-Friendly (&lt;10% tax)</option>
                <option value="has-crypto-data">Has Crypto-Specific Data</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reliableOnly}
                onChange={(e) => setReliableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Show only countries with verified data
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideBannedCountries}
                onChange={(e) => setHideBannedCountries(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Hide countries where crypto is banned
              </span>
            </label>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              ({filteredCountries.length} countries)
            </span>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-violet-800 dark:text-violet-200">
              <p className="font-semibold mb-1">Crypto vs General Capital Gains</p>
              <p>Some countries have different tax rates for cryptocurrencies compared to general capital gains. Crypto-specific rates are shown when available.</p>
            </div>
          </div>
        </motion.div>

        {/* World Map */}
        {!isLoading && countries.length > 0 && (
          <div className="mb-8">
            <WorldTaxMap countries={countries} />
          </div>
        )}

        {/* Top Countries Podium */}
        {!isLoading && countries.length > 0 && (
          <TopCountriesPodium countries={countries} />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Countries Grid */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredCountries.map((country, index) => (
              <motion.div
                key={country.country_code}
                id={`country-${country.country_code}`}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 scroll-mt-24"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* BANNED Warning Banner */}
                {isCryptoBanned(country) && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-200 mb-1">
                          Cryptocurrency is BANNED in this country
                        </h4>
                        <p className="text-xs text-red-800 dark:text-red-300">
                          Trading, holding, or transacting with cryptocurrency may be illegal and subject to penalties.
                          Tax rates shown are not applicable as crypto activities are prohibited.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {country.flag_emoji && (
                        <span className="text-3xl">{country.flag_emoji}</span>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {country.country_name}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {country.country_code}
                      </span>
                      {getCryptoBannedBadge(country)}
                      {getCryptoFriendlyBadge(country)}
                      {getDataQualityBadge(country.data_quality)}
                      {country.updated_at && isRecentlyUpdated(country.updated_at) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">
                          🔄 Recently Updated
                        </span>
                      )}
                    </div>
                    {country.updated_at && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Last updated: {formatDate(country.updated_at)}
                      </div>
                    )}
                    {country.data_sources && country.data_sources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Sources:</span>
                        {country.data_sources.map((source, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    {country.source_url && (
                      <a
                        href={country.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Official Tax Source
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General CGT */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      General Capital Gains Tax
                    </h4>
                    {isCryptoBanned(country) ? (
                      <div className="py-6 px-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-center">
                        <p className="text-sm font-bold text-red-900 dark:text-red-200">
                          🚫 BANNED - Not Applicable
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Crypto is illegal in this country
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Short-term (&lt;1 year)</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {(country.cgt_short_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Long-term (&gt;1 year)</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {(country.cgt_long_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Crypto-Specific */}
                  <div>
                    <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🪙</span>
                      Crypto-Specific Tax
                    </h4>
                    {isCryptoBanned(country) ? (
                      <div className="py-6 px-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-center">
                        <p className="text-sm font-bold text-red-900 dark:text-red-200">
                          🚫 BANNED - Not Applicable
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Cryptocurrency is illegal
                        </p>
                      </div>
                    ) : country.crypto_short_rate !== null && country.crypto_short_rate !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 px-3 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-200 dark:border-violet-800">
                          <span className="text-sm text-violet-700 dark:text-violet-300">Short-term (&lt;1 year)</span>
                          <span className="text-sm font-bold text-violet-900 dark:text-violet-100">
                            {(country.crypto_short_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded border border-fuchsia-200 dark:border-fuchsia-800">
                          <span className="text-sm text-fuchsia-700 dark:text-fuchsia-300">Long-term (&gt;1 year)</span>
                          <span className="text-sm font-bold text-fuchsia-900 dark:text-fuchsia-100">
                            {((country.crypto_long_rate ?? 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        {country.crypto_notes && (
                          <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded text-xs text-violet-800 dark:text-violet-200">
                            <p className="font-semibold mb-1">📌 Crypto Rules:</p>
                            <p>{country.crypto_notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 px-3 bg-slate-50 dark:bg-slate-700/30 rounded text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No crypto-specific data available. General CGT applies.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Structured Tax Metadata */}
                {(country.holding_period_months || country.long_term_discount_pct || country.exemption_threshold ||
                  country.is_flat_tax || country.is_progressive || country.is_territorial) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      📊 Tax Structure Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {country.holding_period_months && (
                        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Holding Period for Long-term</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {country.holding_period_months} months
                          </span>
                        </div>
                      )}
                      {country.long_term_discount_pct && (
                        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Long-term Discount</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {country.long_term_discount_pct}%
                          </span>
                        </div>
                      )}
                      {country.exemption_threshold && (
                        <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Exemption Threshold</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {country.exemption_threshold.toLocaleString()} {country.exemption_threshold_currency || ''}
                          </span>
                        </div>
                      )}
                      {(country.is_flat_tax || country.is_progressive || country.is_territorial) && (
                        <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Tax System:</span>
                          <div className="flex flex-wrap gap-1">
                            {country.is_flat_tax && (
                              <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded">Flat Tax</span>
                            )}
                            {country.is_progressive && (
                              <span className="text-xs bg-fuchsia-600 text-white px-2 py-0.5 rounded">Progressive</span>
                            )}
                            {country.is_territorial && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Territorial</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* General Notes */}
                {country.notes && (
                  <div className={`mt-4 pt-4 border-t ${isCryptoBanned(country) ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className={`text-xs ${isCryptoBanned(country) ? 'text-red-800 dark:text-red-200' : 'text-slate-600 dark:text-slate-400'}`}>
                      <span className="font-semibold">Note:</span> {country.notes}
                    </p>
                  </div>
                )}

                {/* AI Analysis Score Card */}
                {country.ai_analysis && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <CountryScoreCard analysis={country.ai_analysis} />
                  </div>
                )}
              </motion.div>
            ))}

            {filteredCountries.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-slate-500 dark:text-slate-400">No countries found matching your filters.</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            ⚠️ <strong>Disclaimer:</strong> Tax rates shown are for informational purposes only and may not reflect the most current regulations. Always consult a qualified tax professional for accurate advice. Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </div>
    </>
  )
}
