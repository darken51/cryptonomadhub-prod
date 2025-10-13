'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { ArrowLeft, Search, TrendingDown, Info } from 'lucide-react'

interface Country {
  country_code: string
  country_name: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_notes?: string
  notes?: string
  data_quality?: 'high' | 'medium' | 'low' | 'unknown'
  data_sources?: string[]
  updated_at?: string
}

export default function CountriesPage() {
  const { token } = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'crypto-friendly' | 'has-crypto-data'>('all')
  const [reliableOnly, setReliableOnly] = useState(true)  // Show reliable data by default
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

  useEffect(() => {
    fetchCountries()
  }, [token, reliableOnly])

  useEffect(() => {
    filterCountries()
  }, [countries, searchQuery, filterType])

  const fetchCountries = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/regulations/?reliable_only=${reliableOnly}`
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
  }

  const filterCountries = () => {
    let filtered = countries

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType === 'crypto-friendly') {
      // Countries with crypto rates < 10%
      filtered = filtered.filter(c =>
        (c.crypto_long_rate && c.crypto_long_rate < 0.10) ||
        (c.cgt_long_rate < 0.10)
      )
    } else if (filterType === 'has-crypto-data') {
      // Countries with crypto-specific data
      filtered = filtered.filter(c => c.crypto_short_rate !== null && c.crypto_short_rate !== undefined)
    }

    setFilteredCountries(filtered)
  }

  const getCryptoFriendlyBadge = (country: Country) => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Country Tax Regulations
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Browse crypto tax rates for {countries.length}+ countries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Countries
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
              >
                <option value="all">All Countries ({countries.length})</option>
                <option value="crypto-friendly">Crypto-Friendly (&lt;10% tax)</option>
                <option value="has-crypto-data">Has Crypto-Specific Data</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reliableOnly}
                onChange={(e) => setReliableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show only countries with verified data
              </span>
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({filteredCountries.length} countries)
            </span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Crypto vs General Capital Gains</p>
              <p>Some countries have different tax rates for cryptocurrencies compared to general capital gains. Crypto-specific rates are shown when available.</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Countries Grid */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredCountries.map(country => (
              <div
                key={country.country_code}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {country.country_name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {country.country_code}
                      </span>
                      {getCryptoFriendlyBadge(country)}
                      {getDataQualityBadge(country.data_quality)}
                      {country.updated_at && isRecentlyUpdated(country.updated_at) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          🔄 Recently Updated
                        </span>
                      )}
                    </div>
                    {country.updated_at && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Last updated: {formatDate(country.updated_at)}
                      </div>
                    )}
                    {country.data_sources && country.data_sources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Sources:</span>
                        {country.data_sources.map((source, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General CGT */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      General Capital Gains Tax
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Short-term (&lt;1 year)</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {(country.cgt_short_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Long-term (&gt;1 year)</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {(country.cgt_long_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Crypto-Specific */}
                  <div>
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🪙</span>
                      Crypto-Specific Tax
                    </h4>
                    {country.crypto_short_rate !== null && country.crypto_short_rate !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                          <span className="text-sm text-purple-700 dark:text-purple-300">Short-term (&lt;1 year)</span>
                          <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            {(country.crypto_short_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                          <span className="text-sm text-purple-700 dark:text-purple-300">Long-term (&gt;1 year)</span>
                          <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            {((country.crypto_long_rate ?? 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        {country.crypto_notes && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-800 dark:text-purple-200">
                            <p className="font-semibold mb-1">📌 Crypto Rules:</p>
                            <p>{country.crypto_notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 px-3 bg-gray-50 dark:bg-gray-700/30 rounded text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No crypto-specific data available. General CGT applies.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* General Notes */}
                {country.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Note:</span> {country.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No countries found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            ⚠️ <strong>Disclaimer:</strong> Tax rates shown are for informational purposes only and may not reflect the most current regulations. Always consult a qualified tax professional for accurate advice. Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
