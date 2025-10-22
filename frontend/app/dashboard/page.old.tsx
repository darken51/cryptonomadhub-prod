'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { parseCurrencyData } from '@/lib/currency'
import {
  Globe, TrendingDown, MapPin, Sparkles, ArrowRight,
  Search, Calculator, FileText, CreditCard, Target, Award,
  MessageCircle, Settings, Send, Bot, User as UserIcon, Loader2,
  AlertCircle, CheckCircle, Info, XCircle, Clock, TrendingUp,
  DollarSign, Package, X, Wallet, RefreshCw
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  conversation_id: number
  message: string
  suggestions: string[]
  can_simulate: boolean
  simulation_params: any
}

export default function DashboardPage() {
  const { user, isLoading, token } = useAuth()
  const router = useRouter()
  const [recentSimulations, setRecentSimulations] = useState<any[]>([])
  const [stats, setStats] = useState({ count: 0, totalSavings: 0, countriesCompared: 0 })
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => {
    // Load dismissed alerts from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dismissedAlerts')
      if (stored) {
        try {
          return new Set(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse dismissed alerts:', e)
        }
      }
    }
    return new Set()
  })

  // Chat state
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI guide for CryptoNomadHub 🌍\n\nI can help with:\n• DeFi wallet audits & tax reports\n• Tax-loss harvesting opportunities\n• Cost basis tracking (FIFO/LIFO/HIFO)\n• Country comparisons (160 jurisdictions)\n• Crypto cards & tools\n• Complete platform navigation\n\n⚠️ General information only - Not financial or legal advice."
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatTyping, setIsChatTyping] = useState(false)
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([
    'Which countries have 0% crypto tax?',
    'Portugal tax data',
    'Compare France and Portugal'
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Scroll within chat container only, not the whole page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Fetch dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [walletPortfolio, setWalletPortfolio] = useState<any>(null)

  const fetchWalletPortfolio = () => {
    if (token) {
      console.log('[Dashboard] Fetching wallet portfolio...')
      // Add cache-busting timestamp to ensure fresh data (no custom headers to avoid CORS preflight)
      const cacheBuster = `?t=${Date.now()}`
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet-portfolio/overview${cacheBuster}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('[Dashboard] Response status:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('[Dashboard] Wallet portfolio REFRESHED:', data)
          console.log('[Dashboard] total_wallets:', data?.total_wallets)
          setWalletPortfolio(data)
        })
        .catch(err => {
          console.error('[Dashboard] Failed to fetch wallet portfolio:', err)
          setWalletPortfolio(null)
        })
    } else {
      console.log('[Dashboard] No token available for wallet portfolio fetch')
    }
  }

  useEffect(() => {
    if (token) {
      // Fetch dashboard overview
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setDashboardData(data)
          console.log('[Dashboard] Overview data:', data)
        })
        .catch(err => console.error('Failed to fetch dashboard:', err))

      // Fetch wallet portfolio overview
      fetchWalletPortfolio()

      // Fetch simulations for compatibility
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const sims = data.simulations || []
          setRecentSimulations(sims.slice(0, 3))

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

      // Load most recent chat conversation
      loadRecentConversation()
    }
  }, [token])

  const loadRecentConversation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) return

      const conversations = await response.json()
      if (conversations && conversations.length > 0) {
        // Load the most recent conversation
        const mostRecent = conversations[0]
        setCurrentConversationId(mostRecent.id)
        loadConversationMessages(mostRecent.id)
      }
    } catch (error) {
      console.error('Failed to load recent conversation:', error)
    }
  }

  const loadConversationMessages = async (conversationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) return

      const messages = await response.json()
      if (messages && messages.length > 0) {
        setChatMessages(messages)
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error)
    }
  }

  const dismissAlert = async (alertId: string) => {
    // Update state
    const newDismissed = new Set(dismissedAlerts).add(alertId)
    setDismissedAlerts(newDismissed)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedAlerts', JSON.stringify(Array.from(newDismissed)))
    }

    // Notify backend (optional - backend logs but doesn't persist yet)
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/alerts/dismiss`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ alert_id: alertId })
        })
      } catch (error) {
        console.error('Failed to dismiss alert on backend:', error)
      }
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500 text-red-300'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
      case 'success': return 'bg-green-500/10 border-green-500 text-green-300'
      default: return 'bg-blue-500/10 border-blue-500 text-blue-300'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'defi_audit': return <Search className="w-4 h-4" />
      case 'simulation': return <Calculator className="w-4 h-4" />
      case 'chat': return <MessageCircle className="w-4 h-4" />
      case 'cost_basis': return <FileText className="w-4 h-4" />
      case 'tax_opportunity': return <TrendingDown className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const sendChatMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return

    const userMessage: Message = { role: 'user', content: messageText }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatTyping(true)

    try {
      const payload: any = { message: messageText }
      if (currentConversationId) {
        payload.conversation_id = currentConversationId
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data: ChatResponse = await response.json()

      // Update conversation ID if it's a new conversation
      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id)
      }

      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setChatMessages(prev => [...prev, assistantMessage])
      setChatSuggestions(data.suggestions)
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => prev.slice(0, -1))
    } finally {
      setIsChatTyping(false)
    }
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendChatMessage(chatInput)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section - Tax Optimization Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-1">
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.full_name || user?.email?.split('@')[0]} 👋
                </h1>
                <p className="text-lg text-white/70">
                  Your personal crypto tax optimization dashboard
                </p>
              </div>

              {/* Main Content - Score & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Tax Optimization Score Card */}
                <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Target className="w-6 h-6 text-yellow-300" />
                      Tax Optimization Score
                    </h3>
                    <div className="text-4xl font-bold text-white">
                      {dashboardData?.stats?.tax_jurisdiction ? (
                        <>
                          {(() => {
                            const jurisdiction = dashboardData.stats.tax_jurisdiction
                            const taxHeavens = ['PT', 'AE', 'BH', 'KW', 'OM', 'QA', 'SA', 'MC', 'BM', 'KY', 'BS']
                            const score = taxHeavens.includes(jurisdiction) ? 10 :
                                         jurisdiction === 'SG' || jurisdiction === 'HK' ? 8 :
                                         jurisdiction === 'CH' || jurisdiction === 'LU' ? 7 :
                                         jurisdiction === 'US' || jurisdiction === 'FR' || jurisdiction === 'DE' || jurisdiction === 'AU' ? 3 : 5
                            return `${score}/10`
                          })()}
                        </>
                      ) : '0/10'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: dashboardData?.stats?.tax_jurisdiction ?
                            (() => {
                              const jurisdiction = dashboardData.stats.tax_jurisdiction
                              const taxHeavens = ['PT', 'AE', 'BH', 'KW', 'OM', 'QA', 'SA', 'MC', 'BM', 'KY', 'BS']
                              const score = taxHeavens.includes(jurisdiction) ? 10 :
                                           jurisdiction === 'SG' || jurisdiction === 'HK' ? 8 :
                                           jurisdiction === 'CH' || jurisdiction === 'LU' ? 7 :
                                           jurisdiction === 'US' || jurisdiction === 'FR' || jurisdiction === 'DE' || jurisdiction === 'AU' ? 3 : 5
                              return `${score * 10}%`
                            })() : '0%'
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white/80 text-sm">Current jurisdiction:</span>
                      <span className="font-bold text-white">
                        {dashboardData?.stats?.tax_jurisdiction || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white/80 text-sm">Potential savings:</span>
                      <span className="font-bold text-yellow-300 text-lg">
                        <CurrencyDisplay
                          amountUsd={dashboardData?.stats?.potential_tax_savings || stats.totalSavings || 0}
                          amountLocal={dashboardData?.stats?.potential_tax_savings_local}
                          currencyData={parseCurrencyData(dashboardData?.stats)}
                          mode="dual"
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations Card */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    Top Recommendations
                  </h3>

                  {dashboardData?.stats?.tax_jurisdiction ? (
                    <div>
                      <p className="text-sm text-white/80 mb-4">
                        Based on your profile, these jurisdictions could save you money:
                      </p>

                      <div className="space-y-3">
                        {[
                          { code: 'PT', name: 'Portugal', rate: '0%', flag: '🇵🇹', savings: 'Up to 100%' },
                          { code: 'AE', name: 'UAE', rate: '0%', flag: '🇦🇪', savings: 'Up to 100%' },
                          { code: 'SG', name: 'Singapore', rate: '0-17%', flag: '🇸🇬', savings: 'Up to 83%' }
                        ].filter(country => country.code !== dashboardData.stats.tax_jurisdiction).slice(0, 3).map((country) => (
                          <Link
                            key={country.code}
                            href={`/simulations/new?current=${dashboardData.stats.tax_jurisdiction}&target=${country.code}`}
                            className="block bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{country.flag}</span>
                                <div>
                                  <div className="font-bold text-white group-hover:text-yellow-300 transition-colors">
                                    {country.name}
                                  </div>
                                  <div className="text-xs text-white/60">
                                    Crypto tax: {country.rate}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-bold text-sm mb-1">
                                  {country.savings}
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-yellow-300" />
                      </div>
                      <p className="text-white/80 mb-4 max-w-xs">
                        Set your tax jurisdiction to unlock personalized recommendations
                      </p>
                      <Link
                        href="/settings"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Set Jurisdiction Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Portfolio Stats */}
              {walletPortfolio && walletPortfolio.total_wallets > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-400" />
                      Wallet Portfolio
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchWalletPortfolio}
                        className="text-sm text-white/60 hover:text-white/80 transition-colors"
                        title="Refresh wallet data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link
                        href="/wallets"
                        className="text-sm text-violet-300 hover:text-violet-200 font-semibold flex items-center gap-1"
                      >
                        View all wallets
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="text-xs text-white/60 mb-1">Total Value</div>
                      <div className="text-xl font-bold text-white mb-1">
                        <CurrencyDisplay
                          amountUsd={walletPortfolio.total_value_usd}
                          mode="dual"
                        />
                      </div>
                      {walletPortfolio.change_24h_usd !== null && (
                        <div className={`text-xs flex items-center gap-1 ${walletPortfolio.change_24h_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {walletPortfolio.change_24h_usd >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {walletPortfolio.change_24h_usd >= 0 ? '+' : ''}${Math.abs(walletPortfolio.change_24h_usd).toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="text-xs text-white/60 mb-1">Unrealized P&L</div>
                      <div className={`text-xl font-bold ${walletPortfolio.total_unrealized_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {walletPortfolio.total_unrealized_gain_loss >= 0 ? '+' : ''}
                        <CurrencyDisplay
                          amountUsd={Math.abs(walletPortfolio.total_unrealized_gain_loss)}
                          mode="dual"
                        />
                      </div>
                      <div className={`text-xs ${walletPortfolio.unrealized_gain_loss_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {walletPortfolio.unrealized_gain_loss_percent >= 0 ? '+' : ''}
                        {walletPortfolio.unrealized_gain_loss_percent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="text-xs text-white/60 mb-1">Wallets</div>
                      <div className="text-xl font-bold text-white">{walletPortfolio.total_wallets}</div>
                      <div className="text-xs text-white/60">
                        {walletPortfolio.total_tokens} tokens
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="text-xs text-white/60 mb-1">Chains</div>
                      <div className="text-xl font-bold text-white">{walletPortfolio.total_chains}</div>
                      <div className="text-xs text-white/60">
                        Multi-chain tracking
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
                    <div className="text-2xl font-bold text-white mb-1">{stats.count}</div>
                    <div className="text-xs text-white/60">Simulations</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
                    <div className="text-2xl font-bold text-white mb-1">{dashboardData?.stats?.total_audits || 0}</div>
                    <div className="text-xs text-white/60">DeFi Audits</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
                    <div className="text-2xl font-bold text-white mb-1">{stats.countriesCompared}</div>
                    <div className="text-xs text-white/60">Countries Compared</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alerts Section */}
        {dashboardData?.alerts && dashboardData.alerts.filter((alert: any) => !dismissedAlerts.has(alert.id)).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="space-y-3">
              {dashboardData.alerts
                .filter((alert: any) => !dismissedAlerts.has(alert.id))
                .map((alert: any) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-xl border p-4 ${getAlertColors(alert.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{alert.title}</h4>
                        <p className="text-sm opacity-90">{alert.message}</p>
                        {alert.action_label && alert.action_url && (
                          <Link
                            href={alert.action_url}
                            className="inline-flex items-center gap-1 mt-2 text-sm font-semibold hover:underline"
                          >
                            {alert.action_label}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      {alert.dismissible && (
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="opacity-60 hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        )}

        {/* Quick Actions Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/simulations/new">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <Calculator className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">New Simulation</h3>
                <p className="text-sm text-white/80">Compare 2 countries and calculate savings</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Start
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/countries">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <Globe className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Explore 160 Countries</h3>
                <p className="text-sm text-white/80">Discover crypto tax data by country</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/defi-audit">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <Search className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">DeFi Audit</h3>
                <p className="text-sm text-white/80">Analyze your crypto transactions</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Start
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <MessageCircle className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">AI Chat</h3>
                <p className="text-sm text-white/80">Compare tax data from 160 countries</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Chat
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/tax-optimizer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-yellow-600 to-amber-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <TrendingDown className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Tax Analysis</h3>
                <p className="text-sm text-white/80">Identify opportunities (info only)</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/cost-basis">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <FileText className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Cost Basis</h3>
                <p className="text-sm text-white/80">Track your cost basis</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Manage
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/tools">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <CreditCard className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Crypto Cards & ID</h3>
                <p className="text-sm text-white/80">Crypto cards & Digital Residency</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/wallets">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <Wallet className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Wallet Portfolio</h3>
                <p className="text-sm text-white/80">Track multi-chain holdings & P&L</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Manage
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/settings">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl p-6 shadow-xl cursor-pointer group"
              >
                <Settings className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
                <p className="text-sm text-white/80">Configure your account</p>
                <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                  Configure
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        {/* AI Assistant Chat */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bot className="w-8 h-8 text-violet-400" />
                AI Assistant - Crypto Tax Guide
              </h2>
              <p className="text-slate-400 mt-2">DeFi audits • Tax optimization • 160 countries • Cost basis • Tools • Info only - Not advice</p>
            </div>
            <Link
              href="/chat"
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
            >
              Full view
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            {/* Messages */}
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-white text-slate-900 shadow-xl'
                        : 'bg-slate-700/50 text-slate-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isChatTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-700/50 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {chatSuggestions.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/30">
                <div className="flex flex-wrap gap-2">
                  {chatSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendChatMessage(suggestion)}
                      className="px-3 py-1.5 bg-slate-700/50 hover:bg-violet-600 text-slate-300 hover:text-white text-sm rounded-lg transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="mb-2 px-2">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>General information only • Not financial or legal advice</span>
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ex: What are Portugal's tax data?"
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isChatTyping}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatTyping}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isChatTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Tax Opportunities */}
        {dashboardData?.tax_opportunities && dashboardData.tax_opportunities.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-green-400" />
                Tax Optimization Opportunities
              </h2>
              <Link
                href="/tax-optimizer"
                className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.tax_opportunities.slice(0, 3).map((opp: any, index: number) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-slate-400">{opp.token} • {opp.chain}</span>
                    </div>
                    {opp.deadline && (
                      <div className="flex items-center gap-1 text-xs text-orange-400">
                        <Clock className="w-3 h-3" />
                        {new Date(opp.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{opp.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{opp.description}</p>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="text-xs text-green-400 mb-1">Potential Savings</div>
                    <div className="text-2xl font-bold text-green-300">
                      ${opp.potential_savings.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <strong className="text-slate-400">Action:</strong> {opp.recommended_action}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Activities Timeline */}
        {dashboardData?.activities && dashboardData.activities.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-400" />
              Recent Activity
            </h2>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-700">
                {dashboardData.activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="p-4 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white">{activity.title}</h4>
                        {activity.subtitle && (
                          <p className="text-sm text-slate-400 mt-1">{activity.subtitle}</p>
                        )}
                        {activity.metadata && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(activity.metadata).map(([key, value]: [string, any]) => (
                              <span
                                key={key}
                                className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Wallet Overview */}
        {walletPortfolio && walletPortfolio.total_wallets > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-400" />
                Wallet Overview
              </h2>
              <Link
                href="/wallets"
                className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
              >
                Manage wallets
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-white">
                  <CurrencyDisplay
                    amountUsd={walletPortfolio.total_value_usd}
                    mode="dual"
                  />
                </div>
                {walletPortfolio.change_24h_usd !== null && (
                  <div className={`text-xs mt-1 flex items-center gap-1 ${walletPortfolio.change_24h_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {walletPortfolio.change_24h_usd >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {walletPortfolio.change_24h_usd >= 0 ? '+' : ''}${Math.abs(walletPortfolio.change_24h_usd).toFixed(2)} (24h)
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Cost Basis</div>
                <div className="text-2xl font-bold text-white">
                  <CurrencyDisplay
                    amountUsd={walletPortfolio.total_cost_basis}
                    mode="dual"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Unrealized P&L</div>
                <div className={`text-2xl font-bold ${walletPortfolio.total_unrealized_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <CurrencyDisplay
                    amountUsd={walletPortfolio.total_unrealized_gain_loss}
                    mode="dual"
                    showPlusSign
                  />
                </div>
                <div className={`text-xs mt-1 ${walletPortfolio.unrealized_gain_loss_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {walletPortfolio.unrealized_gain_loss_percent >= 0 ? '+' : ''}
                  {walletPortfolio.unrealized_gain_loss_percent.toFixed(2)}%
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Chains</div>
                <div className="text-2xl font-bold text-white">{walletPortfolio.total_chains}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {walletPortfolio.total_wallets} {walletPortfolio.total_wallets === 1 ? 'wallet' : 'wallets'} · {walletPortfolio.total_tokens} tokens
                </div>
              </div>
            </div>

            {walletPortfolio.wallets && walletPortfolio.wallets.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Your Wallets</h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {walletPortfolio.wallets.slice(0, 5).map((wallet: any, index: number) => (
                    <div key={index} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-mono text-xs">
                          {wallet.address.substring(0, 4)}
                        </div>
                        <div>
                          <div className="font-semibold text-white font-mono text-sm">
                            {wallet.name || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                          </div>
                          <div className="text-xs text-slate-400 capitalize">
                            {wallet.chain} · {wallet.total_tokens} {wallet.total_tokens === 1 ? 'token' : 'tokens'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          <CurrencyDisplay
                            amountUsd={wallet.total_value_usd}
                            mode="dual"
                          />
                        </div>
                        <div className={`text-xs ${wallet.total_unrealized_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {wallet.total_unrealized_gain_loss >= 0 ? '+' : ''}
                          <CurrencyDisplay
                            amountUsd={Math.abs(wallet.total_unrealized_gain_loss)}
                            mode="dual"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}


        {/* Recent Simulations */}
        {recentSimulations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-400" />
                Your Recent Simulations
              </h2>
              <Link
                href="/simulations"
                className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSimulations.map((sim, index) => (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-violet-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{sim.current_country === 'FR' ? '🇫🇷' : '🌍'}</div>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                    <div className="text-2xl">{sim.target_country === 'PT' ? '🇵🇹' : '🌍'}</div>
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-400">
                      ${sim.savings?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-slate-400">saved per year</div>
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  )
}
