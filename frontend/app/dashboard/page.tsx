'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/AuthProvider'
import { LogOut, TrendingUp, Globe, FileText, MessageCircle, Activity, Settings, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  const [recentSimulations, setRecentSimulations] = useState<any[]>([])
  const [stats, setStats] = useState({ count: 0, totalSavings: 0, countriesCompared: 0 })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (token) {
      // Fetch recent simulations
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const sims = data.simulations || []
          setRecentSimulations(sims.slice(0, 5))

          // Calculate stats
          const uniqueCountries = new Set()
          let totalSavings = 0
          sims.forEach((sim: any) => {
            uniqueCountries.add(sim.current_country)
            uniqueCountries.add(sim.target_country)
            totalSavings += sim.savings || 0
          })

          setStats({
            count: sims.length,
            totalSavings,
            countriesCompared: uniqueCountries.size
          })
        })
        .catch(err => console.error('Failed to fetch simulations:', err))
    }
  }, [token])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                NomadCrypto Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
          <p className="text-blue-100">
            {t('subtitle')}
          </p>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Assistant - NEW */}
          <Link
            href="/chat"
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('cards.aiChat.title')}
              </h3>
              <p className="text-sm text-white/90">
                {t('cards.aiChat.description')}
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                ✨ {tCommon('new')}
              </span>
            </div>
          </Link>

          {/* Simulate residency */}
          <Link
            href="/simulations/new"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('cards.newSimulation.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('cards.newSimulation.description')}
            </p>
          </Link>

          {/* Compare Multiple Countries - NEW */}
          <Link
            href="/simulations/compare"
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('cards.compareCountries.title')}
              </h3>
              <p className="text-sm text-white/90">
                {t('cards.compareCountries.description')}
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                ✨ {tCommon('new')}
              </span>
            </div>
          </Link>

          {/* DeFi Audit - NEW */}
          <Link
            href="/defi-audit"
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('cards.defiAudit.title')}
              </h3>
              <p className="text-sm text-white/90">
                {t('cards.defiAudit.description')}
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                🔥 {tCommon('new')}
              </span>
            </div>
          </Link>

          {/* Crypto Cards & Tools */}
          <Link
            href="/tools"
            className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Crypto Cards & Tools
              </h3>
              <p className="text-sm text-white/90">
                Spend your crypto globally with the best crypto debit cards
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                💳 Featured
              </span>
            </div>
          </Link>

          {/* Countries */}
          <Link
            href="/countries"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('cards.countries.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('cards.countries.description')}
            </p>
          </Link>

          {/* History */}
          <Link
            href="/simulations/history"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('cards.history.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('cards.history.description')}
            </p>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group"
          >
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('cards.settings.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('cards.settings.description')}
            </p>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('quickStats.title')}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('quickStats.simulations')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('quickStats.countriesCompared')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.countriesCompared}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('quickStats.totalSavings')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stats.totalSavings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('quickStats.subscription')}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('quickStats.freeTier')}</p>
            </div>
          </div>
        </div>

        {/* Recent Simulations */}
        {recentSimulations.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('recentSimulations.title')}
              </h3>
              <Link
                href="/simulations/history"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('recentSimulations.viewAll')}
              </Link>
            </div>
            <div className="space-y-3">
              {recentSimulations.map((sim: any) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sim.current_country} → {sim.target_country}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(sim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${sim.savings?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('recentSimulations.saved')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            <span className="font-bold">⚠️ {t('disclaimer').split(':')[0]}:</span>
            {t('disclaimer').split(':').slice(1).join(':')}
          </p>
        </div>
      </main>
    </div>
  )
}
