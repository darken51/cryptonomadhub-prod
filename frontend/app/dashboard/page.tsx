'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  LogOut, TrendingUp, Globe, FileText, MessageCircle, Activity,
  Settings, CreditCard, Wallet, PieChart, BarChart3, DollarSign,
  Sparkles, ArrowRight, Zap, Shield, Target
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie,
  Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const COLORS = ['#7c3aed', '#d946ef', '#a855f7', '#e879f9', '#9333ea', '#f0abfc', '#6b21a8', '#f5d0fe']

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <AppHeader />

      {/* User Info Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Free Tier</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Banner */}
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-3xl p-8 md:p-12 text-white mb-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Welcome Back!
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-fuchsia-100">
              Your Dashboard
            </h1>
            <p className="text-lg md:text-xl text-violet-100 max-w-2xl mb-6">
              Start by simulating a residency change to see potential tax savings across 160+ countries
            </p>
            <Link
              href="/simulations/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all transform hover:scale-105 shadow-xl"
            >
              <TrendingUp className="w-5 h-5" />
              New Simulation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
              </div>
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Simulations</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.count}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Potential Savings</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              ${stats.totalSavings.toLocaleString()}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              </div>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Countries Compared</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.countriesCompared}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-fuchsia-200" />
            </div>
            <p className="text-sm text-violet-100 mb-1">Portfolio Value</p>
            <p className="text-3xl font-bold">
              ${defiStats.totalPortfolioValue.toLocaleString()}
            </p>
          </motion.div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Chat Assistant */}
          <motion.div variants={itemVariants}>
            <Link
              href="/chat"
              className="group block h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Chat Assistant</h3>
                <p className="text-sm text-violet-100 mb-3">
                  Ask questions about crypto taxes in any country
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* New Simulation */}
          <motion.div variants={itemVariants}>
            <Link
              href="/simulations/new"
              className="group block h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-violet-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                New Simulation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compare tax impact of moving to a new country
              </p>
            </Link>
          </motion.div>

          {/* Compare Countries */}
          <motion.div variants={itemVariants}>
            <Link
              href="/simulations/compare"
              className="group block h-full bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Compare Countries</h3>
                <p className="text-sm text-orange-100 mb-3">
                  Side-by-side comparison of up to 5 countries
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* DeFi Audit */}
          <motion.div variants={itemVariants}>
            <Link
              href="/defi-audit"
              className="group block h-full bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">DeFi Audit</h3>
                <p className="text-sm text-emerald-100 mb-3">
                  Analyze your DeFi activity and calculate taxes
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Zap className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Tax Optimizer */}
          <motion.div variants={itemVariants}>
            <Link
              href="/tax-optimizer"
              className="group block h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tax Optimizer</h3>
                <p className="text-sm text-violet-100 mb-3">
                  Loss harvesting & tax savings strategies
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Target className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Multi-Wallet Manager */}
          <motion.div variants={itemVariants}>
            <Link
              href="/wallets"
              className="group block h-full bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Wallet Manager</h3>
                <p className="text-sm text-cyan-100 mb-3">
                  Manage multiple wallets as portfolio groups
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <PieChart className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Cost Basis Tracking */}
          <motion.div variants={itemVariants}>
            <Link
              href="/cost-basis"
              className="group block h-full bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cost Basis Tracking</h3>
                <p className="text-sm text-rose-100 mb-3">
                  FIFO/LIFO/HIFO lot tracking for accurate taxes
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <BarChart3 className="w-3 h-3" />
                  NEW
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Crypto Cards & Tools */}
          <motion.div variants={itemVariants}>
            <Link
              href="/tools"
              className="group block h-full bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Crypto Cards & Tools</h3>
                <p className="text-sm text-yellow-100 mb-3">
                  Spend your crypto globally with the best crypto debit cards
                </p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <CreditCard className="w-3 h-3" />
                  Featured
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Countries */}
          <motion.div variants={itemVariants}>
            <Link
              href="/countries"
              className="group block h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Countries
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Browse tax regulations for 98 countries
              </p>
            </Link>
          </motion.div>

          {/* History */}
          <motion.div variants={itemVariants}>
            <Link
              href="/simulations/history"
              className="group block h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-violet-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                History
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View your past simulations
              </p>
            </Link>
          </motion.div>

          {/* Settings */}
          <motion.div variants={itemVariants}>
            <Link
              href="/settings"
              className="group block h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Settings
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your account preferences
              </p>
            </Link>
          </motion.div>
        </motion.div>

        {/* Detailed Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Tax Residency Stats */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Tax Residency Stats
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Simulations</p>
                <p className="text-3xl font-bold text-violet-600 dark:text-fuchsia-400">{stats.count}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Countries Compared</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-cyan-400">{stats.countriesCompared}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Potential Savings</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${stats.totalSavings.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Subscription</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Free Tier</p>
              </div>
            </div>
          </motion.div>

          {/* DeFi Portfolio Stats */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  DeFi Portfolio Stats
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-violet-100 mb-2">Portfolio Value</p>
                  <p className="text-3xl font-bold">
                    ${defiStats.totalPortfolioValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-violet-100 mb-2">Unrealized Gains</p>
                  <p className="text-3xl font-bold">
                    ${defiStats.unrealizedGains.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-violet-100 mb-2">Tax Liability</p>
                  <p className="text-3xl font-bold">
                    ${defiStats.taxLiability.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm text-violet-100 mb-2">Cost Basis Lots</p>
                  <p className="text-3xl font-bold">{defiStats.totalLots}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        {(tokenDistribution.length > 0 || costBasisChart.length > 0) && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Token Distribution Pie Chart */}
            {tokenDistribution.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
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
              </motion.div>
            )}

            {/* Cost Basis vs Current Value */}
            {costBasisChart.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
                  Cost Basis vs Current Value
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costBasisChart.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="token" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="costBasis" fill="#7c3aed" name="Cost Basis" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="currentValue" fill="#d946ef" name="Current Value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Recent Simulations */}
        {recentSimulations.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
                Recent Simulations
              </h3>
              <Link
                href="/simulations/history"
                className="text-sm font-medium text-violet-600 dark:text-fuchsia-400 hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentSimulations.map((sim: any) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-violet-50/50 dark:from-slate-800/50 dark:to-violet-900/10 rounded-xl hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/20 dark:hover:to-fuchsia-900/20 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {sim.current_country}
                      <ArrowRight className="w-4 h-4 text-violet-500" />
                      {sim.target_country}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(sim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      ${sim.savings?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      saved
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Important Reminder
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This tool provides general information only and is NOT financial or legal advice. Always consult licensed professionals before making decisions.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
