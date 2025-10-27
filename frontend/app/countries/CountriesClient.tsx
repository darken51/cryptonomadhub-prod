'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

interface CountriesClientProps {
  initialCountries: Country[]
}

export default function CountriesClient({ initialCountries }: CountriesClientProps) {
  const [countries, setCountries] = useState<Country[]>(initialCountries)
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(initialCountries)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'crypto-friendly' | 'has-crypto-data'>('all')
  const [reliableOnly, setReliableOnly] = useState(true)
  const [hideBannedCountries, setHideBannedCountries] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const isCryptoBanned = useCallback((country: Country) => {
    return country.crypto_legal_status === 'banned' ||
           (country.crypto_notes?.toLowerCase().includes('banned') ?? false) ||
           (country.notes?.toLowerCase().includes('banned') ?? false)
  }, [])

  const filterCountries = useCallback(() => {
    let filtered = countries

    if (hideBannedCountries) {
      filtered = filtered.filter(c => !isCryptoBanned(c))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.country_name.toLowerCase().includes(query) ||
        c.country_code.toLowerCase().includes(query)
      )
    }

    if (filterType === 'crypto-friendly') {
      filtered = filtered.filter(c =>
        !isCryptoBanned(c) && (
          (c.crypto_short_rate !== null && c.crypto_short_rate < 10) ||
          (c.cgt_short_rate < 10)
        )
      )
    } else if (filterType === 'has-crypto-data') {
      filtered = filtered.filter(c => c.crypto_short_rate !== null && c.crypto_short_rate !== undefined)
    }

    setFilteredCountries(filtered)
  }, [countries, searchQuery, filterType, hideBannedCountries, isCryptoBanned])

  useEffect(() => {
    filterCountries()
  }, [filterCountries])

  const getCryptoBannedBadge = (country: Country) => {
    if (!isCryptoBanned(country)) return null

    return (
      <div className="mt-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
              ⚠️ Crypto Banned or Restricted
            </p>
            <p className="text-sm text-red-800 dark:text-red-300">
              Cryptocurrency trading, ownership, or transactions may be illegal or heavily restricted in this country.
              {country.crypto_notes && ` ${country.crypto_notes}`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getDataQualityBadge = (quality?: string) => {
    if (!quality || quality === 'unknown') return null

    const badges = {
      high: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        label: 'Verified'
      },
      medium: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        label: 'Estimated'
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

      <div className="flex flex-wrap items-center gap-4 mt-4">
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
    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-violet-800 dark:text-violet-200">
          <p className="font-semibold mb-1">Crypto vs General Capital Gains</p>
          <p>Some countries have different tax rates for cryptocurrencies compared to general capital gains. Crypto-specific rates are shown when available.</p>
        </div>
      </div>
    </div>

    {/* World Map */}
    {countries.length > 0 && (
      <div className="mb-8">
        <WorldTaxMap countries={countries} />
      </div>
    )}

    {/* Top Countries Podium */}
    {countries.length > 0 && (
      <TopCountriesPodium countries={countries} />
    )}

    {/* Countries Grid */}
    <div className="space-y-4">
      {filteredCountries.map((country, index) => (
        <motion.div
          key={country.country_code}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
          className={`bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border-2 transition-all hover:shadow-lg ${
            isCryptoBanned(country)
              ? 'border-red-300 dark:border-red-800'
              : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-fuchsia-700'
          }`}
        >
          <Link
            href={`/countries/${country.country_code.toLowerCase()}`}
            className="block"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{country.flag_emoji || '🌍'}</span>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${
                    isCryptoBanned(country)
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {country.country_name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{country.country_code}</p>
                </div>
              </div>
              {getDataQualityBadge(country.data_quality)}
            </div>

            {getCryptoBannedBadge(country)}

            {!isCryptoBanned(country) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {country.crypto_short_rate !== null && country.crypto_short_rate !== undefined ? (
                  <>
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-lg p-4">
                      <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">Crypto Short-Term</p>
                      <p className="text-2xl font-bold text-violet-900 dark:text-violet-200">{country.crypto_short_rate}%</p>
                      {country.holding_period_months && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                          &lt; {country.holding_period_months} months
                        </p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Crypto Long-Term</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                        {country.crypto_long_rate ?? country.crypto_short_rate}%
                      </p>
                      {country.holding_period_months && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          ≥ {country.holding_period_months} months
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">General CGT Short-Term</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{country.cgt_short_rate}%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">General CGT Long-Term</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{country.cgt_long_rate}%</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {country.crypto_notes && !isCryptoBanned(country) && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">Crypto-Specific Notes:</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{country.crypto_notes}</p>
              </div>
            )}

            {country.notes && (
              <div className={`mt-4 pt-4 border-t ${isCryptoBanned(country) ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
                <p className={`text-xs ${isCryptoBanned(country) ? 'text-red-800 dark:text-red-200' : 'text-slate-600 dark:text-slate-400'}`}>
                  <span className="font-semibold">Note:</span> {country.notes}
                </p>
              </div>
            )}

            {country.ai_analysis && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <CountryScoreCard analysis={country.ai_analysis} />
              </div>
            )}
          </Link>
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

    {/* SEO Content Section */}
    <motion.div
      className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        Understanding Crypto Tax Rates Worldwide
      </h2>

      <div className="prose dark:prose-invert max-w-none">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Countries with 0% Crypto Tax
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Several countries offer <strong>zero capital gains tax on cryptocurrency</strong>, making them attractive
              for digital nomads and crypto investors:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Portugal</strong> - 0% crypto tax for individuals (under review)</li>
              <li><strong>UAE (Dubai)</strong> - 0% personal income tax on crypto gains</li>
              <li><strong>Singapore</strong> - 0% capital gains tax on long-term holdings</li>
              <li><strong>Switzerland</strong> - 0% tax on private crypto gains for individuals</li>
              <li><strong>Germany</strong> - 0% tax after 1 year holding period</li>
              <li><strong>Malaysia</strong> - 0% capital gains tax on crypto</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              How We Verify Tax Data
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Our crypto tax rates are sourced from <strong>official government publications</strong> and verified
              by leading international tax authorities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>OECD</strong> - International tax policy data</li>
              <li><strong>PwC Tax Summaries</strong> - Professional tax firm reports</li>
              <li><strong>KPMG</strong> - Global tax rate surveys</li>
              <li><strong>Koinly</strong> - Crypto-specific tax research</li>
              <li><strong>Government websites</strong> - Direct source verification</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
            Capital Gains Tax vs. Crypto-Specific Tax
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            Many countries treat cryptocurrency differently from traditional assets. While some apply standard
            <strong> capital gains tax (CGT)</strong> rates, others have introduced <strong>crypto-specific regulations</strong>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li><strong>Short-term gains</strong> - Typically taxed at higher rates (held &lt; 1 year)</li>
            <li><strong>Long-term gains</strong> - Lower rates for assets held &gt; 1 year</li>
            <li><strong>Income vs. gains</strong> - Mining, staking, DeFi yields often taxed as income</li>
            <li><strong>Wash sale rules</strong> - Some countries restrict loss harvesting strategies</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">
            💡 How to Use This Database
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
            <li><strong>Search by country name</strong> or use the interactive world map to explore tax rates</li>
            <li><strong>Filter by crypto-friendly countries</strong> (&lt;10% tax) to narrow your options</li>
            <li><strong>Compare multiple countries</strong> side-by-side using our AI scoring system</li>
            <li><strong>Check data quality badges</strong> to ensure you're using verified information</li>
            <li><strong>Consult with tax professionals</strong> - this data is for informational purposes only</li>
          </ol>
        </div>
      </div>
    </motion.div>

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
  )
}
