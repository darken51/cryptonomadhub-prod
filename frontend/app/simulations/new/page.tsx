'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { SimulationExplainer } from '@/components/SimulationExplainer'
import { ArrowLeft, Calculator } from 'lucide-react'

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

// Regional groupings for countries
const REGION_MAP: Record<string, string> = {
  // Europe
  'AD': 'Europe', 'AL': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'BG': 'Europe',
  'BA': 'Europe', 'BY': 'Europe', 'CH': 'Europe', 'CZ': 'Europe', 'DE': 'Europe',
  'DK': 'Europe', 'EE': 'Europe', 'ES': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
  'GB': 'Europe', 'GI': 'Europe', 'GR': 'Europe', 'HR': 'Europe', 'HU': 'Europe',
  'IE': 'Europe', 'IS': 'Europe', 'IT': 'Europe', 'LI': 'Europe', 'LT': 'Europe',
  'LU': 'Europe', 'LV': 'Europe', 'MC': 'Europe', 'MD': 'Europe', 'ME': 'Europe',
  'MK': 'Europe', 'MT': 'Europe', 'NL': 'Europe', 'NO': 'Europe', 'PL': 'Europe',
  'PT': 'Europe', 'RO': 'Europe', 'RS': 'Europe', 'RU': 'Europe', 'SE': 'Europe',
  'SI': 'Europe', 'SK': 'Europe', 'UA': 'Europe', 'XK': 'Europe',

  // Americas
  'AR': 'Americas', 'BB': 'Americas', 'BO': 'Americas', 'BR': 'Americas',
  'CA': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'CR': 'Americas',
  'DO': 'Americas', 'EC': 'Americas', 'GT': 'Americas', 'GY': 'Americas',
  'HN': 'Americas', 'JM': 'Americas', 'MX': 'Americas', 'NI': 'Americas',
  'PA': 'Americas', 'PE': 'Americas', 'PR': 'Americas', 'PY': 'Americas',
  'SV': 'Americas', 'TT': 'Americas', 'US': 'Americas', 'UY': 'Americas',
  'VE': 'Americas',

  // Asia & Pacific
  'AU': 'Asia & Pacific', 'AZ': 'Asia & Pacific', 'BD': 'Asia & Pacific',
  'BN': 'Asia & Pacific', 'CN': 'Asia & Pacific', 'GE': 'Asia & Pacific',
  'HK': 'Asia & Pacific', 'ID': 'Asia & Pacific', 'IN': 'Asia & Pacific',
  'JP': 'Asia & Pacific', 'KH': 'Asia & Pacific', 'KR': 'Asia & Pacific',
  'KZ': 'Asia & Pacific', 'LA': 'Asia & Pacific', 'LK': 'Asia & Pacific',
  'MM': 'Asia & Pacific', 'MN': 'Asia & Pacific', 'MO': 'Asia & Pacific',
  'MY': 'Asia & Pacific', 'NZ': 'Asia & Pacific', 'PG': 'Asia & Pacific',
  'PH': 'Asia & Pacific', 'PK': 'Asia & Pacific', 'SG': 'Asia & Pacific',
  'TH': 'Asia & Pacific', 'TL': 'Asia & Pacific', 'TW': 'Asia & Pacific',
  'UZ': 'Asia & Pacific', 'VN': 'Asia & Pacific',

  // Middle East & Africa
  'AE': 'Middle East & Africa', 'AM': 'Middle East & Africa', 'AO': 'Middle East & Africa',
  'BH': 'Middle East & Africa', 'BW': 'Middle East & Africa', 'CD': 'Middle East & Africa',
  'CG': 'Middle East & Africa', 'CI': 'Middle East & Africa', 'CM': 'Middle East & Africa',
  'CV': 'Middle East & Africa', 'DZ': 'Middle East & Africa', 'EG': 'Middle East & Africa',
  'ET': 'Middle East & Africa', 'GA': 'Middle East & Africa', 'GH': 'Middle East & Africa',
  'GQ': 'Middle East & Africa', 'IL': 'Middle East & Africa', 'IQ': 'Middle East & Africa',
  'JO': 'Middle East & Africa', 'KE': 'Middle East & Africa', 'KW': 'Middle East & Africa',
  'LB': 'Middle East & Africa', 'LR': 'Middle East & Africa', 'LY': 'Middle East & Africa',
  'MA': 'Middle East & Africa', 'MG': 'Middle East & Africa', 'MR': 'Middle East & Africa',
  'MU': 'Middle East & Africa', 'MZ': 'Middle East & Africa', 'NA': 'Middle East & Africa',
  'NG': 'Middle East & Africa', 'OM': 'Middle East & Africa', 'PS': 'Middle East & Africa',
  'QA': 'Middle East & Africa', 'RW': 'Middle East & Africa', 'SA': 'Middle East & Africa',
  'SC': 'Middle East & Africa', 'SN': 'Middle East & Africa', 'SZ': 'Middle East & Africa',
  'TD': 'Middle East & Africa', 'TN': 'Middle East & Africa', 'TR': 'Middle East & Africa',
  'TZ': 'Middle East & Africa', 'UG': 'Middle East & Africa', 'ZA': 'Middle East & Africa',
  'ZM': 'Middle East & Africa', 'ZW': 'Middle East & Africa',
}

interface Country {
  code: string
  name: string
  flag_emoji?: string
  source_url?: string
}

export default function NewSimulationPage() {
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

        // Group by region
        const grouped: Record<string, Country[]> = {}
        countryList.forEach(country => {
          const region = REGION_MAP[country.code] || 'Other'
          if (!grouped[region]) {
            grouped[region] = []
          }
          grouped[region].push(country)
        })

        // Sort countries within each region
        Object.keys(grouped).forEach(region => {
          grouped[region].sort((a, b) => a.name.localeCompare(b.name))
        })

        setCountriesByRegion(grouped)
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            New Tax Simulation
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Compare your current country with a potential target country
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="currentCountry"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Current Country
              </label>
              <select
                id="currentCountry"
                required
                value={currentCountry}
                onChange={(e) => setCurrentCountry(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Target Country
              </label>
              <select
                id="targetCountry"
                required
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Short-Term Gains (held &lt;1 year)
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                <input
                  id="shortTermGains"
                  type="number"
                  step="0.01"
                  min="0"
                  value={shortTermGains}
                  onChange={(e) => setShortTermGains(e.target.value)}
                  className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="longTermGains"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Long-Term Gains (held &gt;1 year)
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                <input
                  id="longTermGains"
                  type="number"
                  step="0.01"
                  min="0"
                  value={longTermGains}
                  onChange={(e) => setLongTermGains(e.target.value)}
                  className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </button>
          </form>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Simulation Results
              </h2>

              {/* Visual Comparison Bar Chart */}
              <div className="mb-8">
                <div className="space-y-4">
                  {/* Current Country Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {result.current_country} (Current)
                      </span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        ${result.current_tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-red-500 h-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
                        style={{ width: '100%' }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {((result.current_tax / Math.max(result.current_tax, result.target_tax)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Country Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {result.target_country} (Target)
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ${result.target_tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-green-500 h-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.max(5, (result.target_tax / Math.max(result.current_tax, result.target_tax)) * 100)}%`
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {((result.target_tax / Math.max(result.current_tax, result.target_tax)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current Country ({result.current_country})
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    ${result.current_tax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Target Country ({result.target_country})
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    ${result.target_tax.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="bg-green-500 rounded-full p-1.5 sm:p-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">
                    💰 Potential Annual Savings
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
              </div>
            </div>

            {/* Export PDF Button */}
            <div className="flex justify-end mb-6">
              <button
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

                    showToast('PDF report downloaded! 📄', 'success')
                  } catch (error: any) {
                    showToast(error.message || 'Failed to export PDF', 'error')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF Report
              </button>
            </div>

            {/* Explain Decision */}
            <SimulationExplainer explanation={result.explanation} />

            {/* Considerations & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  ✅ Considerations
                </h3>
                <ul className="space-y-2">
                  {result.considerations.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-blue-800 dark:text-blue-300">
                      • {renderTextWithLinks(item)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-red-900 dark:text-red-200 mb-3">⚠️ Risks</h3>
                <ul className="space-y-2">
                  {result.risks.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-red-800 dark:text-red-300">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
