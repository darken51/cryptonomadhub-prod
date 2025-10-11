'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { SimulationExplainer } from '@/components/SimulationExplainer'
import { ArrowLeft, Calculator } from 'lucide-react'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'SG', name: 'Singapore' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
]

export default function NewSimulationPage() {
  const { user, token } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [targetCountry, setTargetCountry] = useState('')
  const [shortTermGains, setShortTermGains] = useState('')
  const [longTermGains, setLongTermGains] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast('Please login first', 'error')
      router.push('/auth/login')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/residency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_country: targetCountry,
          short_term_gains: parseFloat(shortTermGains) || 0,
          long_term_gains: parseFloat(longTermGains) || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Simulation failed')
      }

      const data = await response.json()
      setResult(data)
      showToast('Simulation completed!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to run simulation', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            New Tax Simulation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Compare your current country with a potential target country
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="shortTermGains"
                  type="number"
                  step="0.01"
                  value={shortTermGains}
                  onChange={(e) => setShortTermGains(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="longTermGains"
                  type="number"
                  step="0.01"
                  value={longTermGains}
                  onChange={(e) => setLongTermGains(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {isLoading ? 'Calculating...' : 'Run Simulation'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Simulation Results
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current Country ({result.current_country})
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${result.current_tax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Target Country ({result.target_country})
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${result.target_tax.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                  Potential Savings
                </p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  ${result.savings.toLocaleString()}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  {result.savings_percent.toFixed(1)}% reduction
                </p>
              </div>
            </div>

            {/* Explain Decision */}
            <SimulationExplainer explanation={result.explanation} />

            {/* Considerations & Risks */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  ✅ Considerations
                </h3>
                <ul className="space-y-2">
                  {result.considerations.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-blue-800 dark:text-blue-300">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-3">⚠️ Risks</h3>
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
