'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { Tooltip } from '@/components/Tooltip'
import { ArrowLeft, Calculator, GitCompare, RotateCcw, ChevronDown } from 'lucide-react'
import { groupCountriesByRegion } from '@/lib/constants'

// Helper to render text with clickable links
function renderTextWithLinks(text: string) {
  // Split by URLs and internal paths
  const urlPattern = /(https?:\/\/[^\s]+)|(\/[a-z-]+)/gi
  const parts = text.split(urlPattern).filter(part => part !== undefined && part !== '')

  return parts.map((part, i) => {
    if (!part) return null

    // External URL
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          {part}
        </a>
      )
    }
    // Internal path like /tools, /cost-basis
    if (part.match(/^\/[a-z-]+$/)) {
      return (
        <Link
          key={i}
          href={part}
          className="underline hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
        >
          {part}
        </Link>
      )
    }
    // Regular text
    return <span key={i}>{part}</span>
  })
}

// Region mapping now imported from shared constants

interface Country {
  code: string
  name: string
}

interface CountryComparison {
  country_code: string
  country_name: string
  flag_emoji?: string
  tax_amount: number
  savings: number
  savings_percent: number
  effective_rate: number
  short_term_tax?: number
  long_term_tax?: number
  short_term_rate?: number
  long_term_rate?: number
}

interface CompareResult {
  current_country: string
  current_tax: number
  comparisons: CountryComparison[]
  short_term_gains: number
  long_term_gains: number
  total_gains: number
  recommendations?: string[]
}

export default function ComparePage() {
  const { user, token } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [currentCountry, setCurrentCountry] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [shortTermGains, setShortTermGains] = useState('')
  const [longTermGains, setLongTermGains] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesByRegion, setCountriesByRegion] = useState<Record<string, Country[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regulations/`)
      if (response.ok) {
        const data = await response.json()

        // Convert to simple format
        const countryList: Country[] = data.map((c: any) => ({
          code: c.country_code,
          name: c.country_name
        }))

        setCountries(countryList)

        // Group by region using shared utility
        const grouped = groupCountriesByRegion(countryList)
        setCountriesByRegion(grouped)
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    }
  }

  const handleCountryToggle = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      setSelectedCountries(selectedCountries.filter(c => c !== countryCode))
    } else {
      if (selectedCountries.length >= 5) {
        showToast('Maximum 5 countries allowed', 'error')
        return
      }
      setSelectedCountries([...selectedCountries, countryCode])
    }
  }

  // Filter countries by search term
  const filteredCountriesByRegion = Object.entries(countriesByRegion).reduce((acc, [region, countries]) => {
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[region] = filtered
    }
    return acc
  }, {} as Record<string, Country[]>)

  const handleReset = () => {
    setCurrentCountry('')
    setSelectedCountries([])
    setShortTermGains('')
    setLongTermGains('')
    setResult(null)
    setExpandedRows(new Set())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleRowExpansion = (countryCode: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(countryCode)) {
      newExpanded.delete(countryCode)
    } else {
      newExpanded.add(countryCode)
    }
    setExpandedRows(newExpanded)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast('Please login first', 'error')
      router.push('/auth/login')
      return
    }

    // Validation
    if (selectedCountries.length < 2) {
      showToast('Please select at least 2 countries to compare', 'error')
      return
    }

    if (selectedCountries.includes(currentCountry)) {
      showToast('Cannot include current country in comparison', 'error')
      return
    }

    const shortGains = parseFloat(shortTermGains) || 0
    const longGains = parseFloat(longTermGains) || 0

    if (shortGains < 0 || longGains < 0) {
      showToast('Gains cannot be negative', 'error')
      return
    }

    if (shortGains === 0 && longGains === 0) {
      showToast('Please enter at least one gain amount', 'error')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_country: currentCountry,
          target_countries: selectedCountries,
          short_term_gains: shortGains,
          long_term_gains: longGains,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Comparison failed')
      }

      const data = await response.json()
      setResult(data)
      showToast('Comparison completed! 🎉', 'success')

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      showToast(error.message || 'Failed to run comparison. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-violet-600 dark:text-fuchsia-400 hover:text-violet-700 dark:hover:text-fuchsia-300 mb-3 sm:mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                <GitCompare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Compare Multiple Countries
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Compare tax rates across up to 5 countries side-by-side
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl mb-6 sm:mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Country */}
              <div>
                <label
                  htmlFor="currentCountry"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Current Country
                </label>
                <select
                  id="currentCountry"
                  required
                  value={currentCountry}
                  onChange={(e) => setCurrentCountry(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white hover:border-violet-400 transition-colors"
                >
                  <option value="">Select your current country</option>
                  {Object.entries(countriesByRegion).map(([region, countries]) => (
                    <optgroup key={region} label={`🌍 ${region}`}>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Countries to Compare */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Countries to Compare (2-5 countries) <span className="text-red-500">*</span>
                </label>
                <div className={`text-xs sm:text-sm mb-3 font-semibold px-3 py-2 rounded-lg ${
                  selectedCountries.length < 2
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                }`}>
                  {selectedCountries.length < 2
                    ? `Select at least ${2 - selectedCountries.length} more country/countries (${selectedCountries.length}/5 selected)`
                    : `${selectedCountries.length}/5 countries selected`
                  }
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <input
                    type="search"
                    placeholder="🔍 Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  {searchTerm && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Found {Object.values(filteredCountriesByRegion).flat().length} countries
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(filteredCountriesByRegion).map(([region, countries]) => (
                    <div key={region} className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {region}
                      </h3>
                      <div className="space-y-1">
                        {countries.map((country) => (
                          <label
                            key={country.code}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition ${
                              currentCountry === country.code ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCountries.includes(country.code)}
                              onChange={() => handleCountryToggle(country.code)}
                              disabled={currentCountry === country.code}
                              className="w-4 h-4 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {country.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gains */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="shortTermGains"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Short-Term Gains (held &lt;1 year)
                    <Tooltip content="Crypto held less than 12 months before selling. Often taxed as ordinary income at higher rates." />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm sm:text-base">$</span>
                    <input
                      id="shortTermGains"
                      type="number"
                      step="0.01"
                      min="0"
                      value={shortTermGains}
                      onChange={(e) => setShortTermGains(e.target.value)}
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white hover:border-violet-400 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="longTermGains"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Long-Term Gains (held &gt;1 year)
                    <Tooltip content="Crypto held more than 12 months before selling. Often taxed at preferential capital gains rates (lower than short-term)." />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm sm:text-base">$</span>
                    <input
                      id="longTermGains"
                      type="number"
                      step="0.01"
                      min="0"
                      value={longTermGains}
                      onChange={(e) => setLongTermGains(e.target.value)}
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white hover:border-violet-400 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {selectedCountries.length < 2 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-800 dark:text-yellow-200">
                  Please select at least 2 countries to compare from the list above
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || selectedCountries.length < 2}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Comparing...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Compare Countries
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Loading Skeleton */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 animate-pulse"
            >
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="h-6 bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900/50 dark:to-fuchsia-900/50 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
                  Comparison Results
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Current Country</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{result.current_country}</p>
                    <p className="text-sm text-slate-500">${result.current_tax.toLocaleString()} tax</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Gains</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      ${result.total_gains.toLocaleString()}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Countries Compared</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {result.comparisons.length}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Reset Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-md hover:shadow-lg transition-all font-medium border border-slate-300 dark:border-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Comparison
                </motion.button>
              </motion.div>

              {/* Comparison Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Tax Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Savings
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Effective Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {result.comparisons.map((comparison, index) => {
                        const isExpanded = expandedRows.has(comparison.country_code)
                        return (
                          <React.Fragment key={comparison.country_code}>
                            <motion.tr
                              key={comparison.country_code}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="transition cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
                              onClick={() => toggleRowExpansion(comparison.country_code)}
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold ${
                                    index === 0 ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border-2 border-green-300 dark:border-green-700' :
                                    index === 1 ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300' :
                                    index === 2 ? 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-300' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{comparison.flag_emoji || '🌍'}</span>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                      {comparison.country_name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {comparison.country_code}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                                  ${comparison.tax_amount.toLocaleString()}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                <div className={`text-sm sm:text-base font-bold ${
                                  comparison.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {comparison.savings > 0 ? '+' : ''}${comparison.savings.toLocaleString()}
                                </div>
                                <div className={`text-xs ${
                                  comparison.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  ({comparison.savings_percent.toFixed(1)}%)
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                                  {comparison.effective_rate.toFixed(1)}%
                                </div>
                              </td>
                            </motion.tr>
                            {isExpanded && (
                              <motion.tr
                                key={`${comparison.country_code}-details`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50 dark:bg-slate-800/50"
                              >
                                <td colSpan={5} className="px-4 sm:px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Tax</p>
                                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        ${comparison.tax_amount.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        Effective Rate: {comparison.effective_rate.toFixed(2)}%
                                      </p>
                                    </div>

                                    {comparison.short_term_tax !== undefined && (
                                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Short-Term (&lt;1 year)</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                          ${comparison.short_term_tax.toLocaleString()}
                                        </p>
                                        {comparison.short_term_rate !== undefined && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Rate: {comparison.short_term_rate.toFixed(2)}%
                                          </p>
                                        )}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          On ${result.short_term_gains.toLocaleString()} gains
                                        </p>
                                      </div>
                                    )}

                                    {comparison.long_term_tax !== undefined && (
                                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Long-Term (&gt;1 year)</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                          ${comparison.long_term_tax.toLocaleString()}
                                        </p>
                                        {comparison.long_term_rate !== undefined && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Rate: {comparison.long_term_rate.toFixed(2)}%
                                          </p>
                                        )}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          On ${result.long_term_gains.toLocaleString()} gains
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
                                    Click on row to collapse details
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Option Highlight */}
              {result.comparisons.length > 0 && result.comparisons[0].savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 shadow-md">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                        Best Option: {result.comparisons[0].country_name}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Moving to {result.comparisons[0].country_name} could save you{' '}
                        <span className="font-bold">${result.comparisons[0].savings.toLocaleString()}</span>{' '}
                        ({result.comparisons[0].savings_percent.toFixed(1)}% reduction) in taxes per year.
                      </p>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Effective tax rate: {result.comparisons[0].effective_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 shadow-lg"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    Recommendations for Digital Nomads
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-blue-800 dark:text-blue-300">
                        {renderTextWithLinks(item)}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
