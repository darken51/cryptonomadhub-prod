'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { SimulationExplainer } from '@/components/SimulationExplainer'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { Tooltip } from '@/components/Tooltip'
import { ArrowLeft, Calculator, Sparkles, RotateCcw } from 'lucide-react'
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

interface Country {
  code: string
  name: string
  flag_emoji?: string
  source_url?: string
}

function NewSimulationPageContent() {
  const { user, token } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentCountry, setCurrentCountry] = useState('')
  const [targetCountry, setTargetCountry] = useState('')
  const [shortTermGains, setShortTermGains] = useState('')
  const [longTermGains, setLongTermGains] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesByRegion, setCountriesByRegion] = useState<Record<string, Country[]>>({})

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries()
  }, [])

  // Pre-fill from URL params (from chat)
  useEffect(() => {
    const current = searchParams.get('current')
    const target = searchParams.get('target')
    const short = searchParams.get('short')
    const long = searchParams.get('long')

    if (current) setCurrentCountry(current)
    if (target) setTargetCountry(target)
    if (short) setShortTermGains(short)
    if (long) setLongTermGains(long)
  }, [searchParams])

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regulations/`)
      if (response.ok) {
        const data = await response.json()

        // Convert to simple format
        const countryList: Country[] = data.map((c: any) => ({
          code: c.country_code,
          name: c.country_name,
          flag_emoji: c.flag_emoji,
          source_url: c.source_url
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

  const handleReset = () => {
    setCurrentCountry('')
    setTargetCountry('')
    setShortTermGains('')
    setLongTermGains('')
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast('Please login first', 'error')
      router.push('/auth/login')
      return
    }

    // Client-side validation
    if (currentCountry === targetCountry) {
      showToast('Current and target countries must be different', 'error')
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
    setResult(null) // Clear previous results

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/residency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_country: currentCountry,
          target_country: targetCountry,
          short_term_gains: shortGains,
          long_term_gains: longGains,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Simulation failed')
      }

      const data = await response.json()
      setResult(data)
      showToast('Simulation completed! 🎉', 'success')

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      showToast(error.message || 'Failed to run simulation. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                New Tax Simulation
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Compare your current country with a potential target country
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
                          {country.flag_emoji ? `${country.flag_emoji} ` : ''}{country.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="targetCountry"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Target Country
                </label>
                <select
                  id="targetCountry"
                  required
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white hover:border-violet-400 transition-colors"
                >
                  <option value="">Select target country</option>
                  {Object.entries(countriesByRegion).map(([region, countries]) => (
                    <optgroup key={region} label={`🌍 ${region}`}>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag_emoji ? `${country.flag_emoji} ` : ''}{country.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Run Simulation
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
              className="space-y-6 animate-pulse"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="h-8 bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900/50 dark:to-fuchsia-900/50 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-32 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
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
              {/* Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                  Simulation Results
                </h2>

                {/* Visual Comparison Bar Chart */}
                <div className="mb-8">
                  <div className="space-y-4">
                    {/* Current Country Bar */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {result.current_country} (Current)
                        </span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          ${result.current_tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full flex items-center justify-end pr-3"
                        >
                          <span className="text-xs font-semibold text-white">
                            {((result.current_tax / Math.max(result.current_tax, result.target_tax)) * 100).toFixed(0)}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Target Country Bar */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {result.target_country} (Target)
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${result.target_tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(5, (result.target_tax / Math.max(result.current_tax, result.target_tax)) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-full flex items-center justify-end pr-3"
                        >
                          <span className="text-xs font-semibold text-white">
                            {((result.target_tax / Math.max(result.current_tax, result.target_tax)) * 100).toFixed(0)}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Current Country ({result.current_country})
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      ${result.current_tax.toLocaleString()}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Target Country ({result.target_country})
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      ${result.target_tax.toLocaleString()}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1.5 sm:p-2 shadow-md">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">
                      Potential Annual Savings
                    </p>
                  </div>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                    ${result.savings.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1 rounded-full">
                      {result.savings_percent.toFixed(1)}% reduction
                    </span>
                    <span className="text-xs text-green-700 dark:text-green-300">
                      per year
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 justify-end mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-md hover:shadow-lg transition-all font-medium border border-slate-300 dark:border-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Simulation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      showToast('Generating PDF report...', 'info')
                      const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/simulations/${result.id}/export/pdf`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        }
                      )

                      if (!response.ok) {
                        throw new Error('Failed to generate PDF')
                      }

                      // Create blob and download
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `tax_simulation_${result.current_country}_to_${result.target_country}_${result.id}.pdf`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)

                      showToast('PDF report downloaded!', 'success')
                    } catch (error: any) {
                      showToast(error.message || 'Failed to export PDF', 'error')
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF Report
                </motion.button>
              </motion.div>

              {/* Explain Decision */}
              <SimulationExplainer explanation={result.explanation} />

              {/* Considerations & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6 shadow-lg"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    Considerations
                  </h3>
                  <ul className="space-y-2">
                    {result.considerations.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-blue-800 dark:text-blue-300">
                        {renderTextWithLinks(item)}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 shadow-lg"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-red-900 dark:text-red-200 mb-3">Risks</h3>
                  <ul className="space-y-2">
                    {result.risks.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-red-800 dark:text-red-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function NewSimulationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSimulationPageContent />
    </Suspense>
  )
}
