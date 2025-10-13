'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from 'lucide-react'

export default function SimulationHistoryPage() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [simulations, setSimulations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setSimulations(data.simulations || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch simulations:', err)
          setLoading(false)
        })
    }
  }, [token])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Simulation History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            All your past tax simulations
          </p>
        </div>

        {/* Simulations List */}
        {simulations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No simulations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your first tax simulation
            </p>
            <Link
              href="/simulations/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              New Simulation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((sim: any) => (
              <div
                key={sim.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {sim.current_country} → {sim.target_country}
                      </h3>
                      {sim.savings > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                          <TrendingDown className="w-3 h-3" />
                          {sim.savings_percent.toFixed(1)}% less tax
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {Math.abs(sim.savings_percent).toFixed(1)}% more tax
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Current Tax
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${sim.current_tax?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Target Tax
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${sim.target_tax?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Savings
                        </p>
                        <p className={`text-lg font-bold ${sim.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ${Math.abs(sim.savings)?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(sim.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
