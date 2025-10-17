'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { LogOut, TrendingUp, Globe, FileText, MessageCircle, Activity, Settings, CreditCard, Wallet, PieChart, BarChart3, DollarSign } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  const [recentSimulations, setRecentSimulations] = useState<any[]>([])
  const [stats, setStats] = useState({ count: 0, totalSavings: 0, countriesCompared: 0 })

  // DeFi Stats
  const [defiStats, setDefiStats] = useState({
    totalPortfolioValue: 0,
    unrealizedGains: 0,
    unrealizedLosses: 0,
    taxLiability: 0,
    totalLots: 0,
    totalAudits: 0
  })

  const [portfolioChart, setPortfolioChart] = useState<any[]>([])
  const [tokenDistribution, setTokenDistribution] = useState<any[]>([])
  const [costBasisChart, setCostBasisChart] = useState<any[]>([])

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

      // Fetch DeFi stats
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/portfolio`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => null),

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tax-optimizer/analyze`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => null),

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/defi-audit/history`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => null)
      ]).then(([portfolio, taxAnalysis, audits]) => {
        if (portfolio) {
          setDefiStats(prev => ({
            ...prev,
            totalLots: portfolio.total_lots || 0,
            totalPortfolioValue: portfolio.total_value_usd || 0
          }))

          // Build token distribution
          if (portfolio.tokens_summary) {
            const tokens = Object.entries(portfolio.tokens_summary).map(([token, data]: [string, any]) => ({
              name: token,
              value: data.total_value_usd
            }))
            setTokenDistribution(tokens)
          }

          // Build cost basis chart
          if (portfolio.by_token) {
            const cbData = Object.entries(portfolio.by_token).map(([token, data]: [string, any]) => ({
              token,
              costBasis: data.total_cost_basis,
              currentValue: data.total_current_value,
              gain: data.total_current_value - data.total_cost_basis
            }))
            setCostBasisChart(cbData)
          }
        }

        if (taxAnalysis) {
          setDefiStats(prev => ({
            ...prev,
            unrealizedGains: taxAnalysis.unrealized_gains || 0,
            unrealizedLosses: taxAnalysis.unrealized_losses || 0,
            taxLiability: (taxAnalysis.unrealized_gains || 0) * 0.20 // Estimate
          }))
        }

        if (audits) {
          setDefiStats(prev => ({
            ...prev,
            totalAudits: audits.length || 0
          }))
        }
      })
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D']

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
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-blue-100">
            Start by simulating a residency change to see potential tax savings
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
                AI Chat Assistant
              </h3>
              <p className="text-sm text-white/90">
                Ask questions about crypto taxes in any country
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                ✨ NEW
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
              New Simulation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare tax impact of moving to a new country
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
                Compare Countries
              </h3>
              <p className="text-sm text-white/90">
                Side-by-side comparison of up to 5 countries
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                ✨ NEW
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
                DeFi Audit
              </h3>
              <p className="text-sm text-white/90">
                Analyze your DeFi activity and calculate taxes
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                🔥 NEW
              </span>
            </div>
          </Link>

          {/* Tax Optimizer - NEW */}
          <Link
            href="/tax-optimizer"
            className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Tax Optimizer
              </h3>
              <p className="text-sm text-white/90">
                Loss harvesting & tax savings strategies
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                💡 NEW
              </span>
            </div>
          </Link>

          {/* Multi-Wallet Manager - NEW */}
          <Link
            href="/wallets"
            className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Multi-Wallet Manager
              </h3>
              <p className="text-sm text-white/90">
                Manage multiple wallets as portfolio groups
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                📊 NEW
              </span>
            </div>
          </Link>

          {/* Cost Basis Tracking - NEW */}
          <Link
            href="/cost-basis"
            className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Cost Basis Tracking
              </h3>
              <p className="text-sm text-white/90">
                FIFO/LIFO/HIFO lot tracking for accurate taxes
              </p>
              <span className="inline-block mt-2 bg-white/20 text-xs font-semibold px-2 py-1 rounded-full">
                📈 NEW
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
              Countries
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse tax regulations for 98 countries
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
              History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View your past simulations
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
              Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your account preferences
            </p>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tax Residency Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tax Residency Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Simulations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Countries Compared</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.countriesCompared}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${stats.totalSavings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscription</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Free Tier</p>
              </div>
            </div>
          </div>

          {/* DeFi Portfolio Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              DeFi Portfolio Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${defiStats.totalPortfolioValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unrealized Gains</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${defiStats.unrealizedGains.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tax Liability</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${defiStats.taxLiability.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cost Basis Lots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{defiStats.totalLots}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {(tokenDistribution.length > 0 || costBasisChart.length > 0) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Token Distribution Pie Chart */}
            {tokenDistribution.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Portfolio Token Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={tokenDistribution.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tokenDistribution.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Cost Basis vs Current Value */}
            {costBasisChart.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cost Basis vs Current Value
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costBasisChart.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="token" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="costBasis" fill="#6366f1" name="Cost Basis" />
                    <Bar dataKey="currentValue" fill="#10b981" name="Current Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Recent Simulations */}
        {recentSimulations.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Simulations
              </h3>
              <Link
                href="/simulations/history"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
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
                      saved
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
            <span className="font-bold">⚠️ Reminder:</span> This tool provides general information only and is NOT financial or legal advice. Always consult licensed professionals before making decisions.
          </p>
        </div>
      </main>
    </div>
  )
}
