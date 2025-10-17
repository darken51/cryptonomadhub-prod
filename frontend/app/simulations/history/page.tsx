'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { ArrowLeft, Calendar, TrendingDown, TrendingUp, History } from 'lucide-react'

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
      <>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-violet-600 dark:text-fuchsia-400 hover:text-violet-700 dark:hover:text-fuchsia-300 mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Simulation History
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              All your past tax simulations
            </p>
          </motion.div>

          {/* Simulations List */}
          {simulations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-violet-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No simulations yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start by creating your first tax simulation
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/simulations/new"
                  className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  New Simulation
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {simulations.map((sim: any, index: number) => (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {sim.current_country} → {sim.target_country}
                        </h3>
                        {sim.savings > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                            <TrendingDown className="w-3 h-3" />
                            {sim.savings_percent.toFixed(1)}% less tax
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                            <TrendingUp className="w-3 h-3" />
                            {Math.abs(sim.savings_percent).toFixed(1)}% more tax
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Current Tax
                          </p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            ${sim.current_tax?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Target Tax
                          </p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            ${sim.target_tax?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Savings
                          </p>
                          <p className={`text-lg font-bold ${sim.savings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ${Math.abs(sim.savings)?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(sim.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
