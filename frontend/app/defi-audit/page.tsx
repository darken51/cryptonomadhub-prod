'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { ArrowLeft, Plus, ExternalLink, ChevronDown, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CurrencyDisplay, CurrencyBadge } from '@/components/CurrencyDisplay'
import { parseCurrencyData } from '@/lib/currency'
import { trackDeFiAudit } from '@/lib/analytics'

// Composant Timer qui se met à jour automatiquement
function ProcessingTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startTime = new Date(createdAt).getTime()

    // Mise à jour immédiate
    setElapsed(Math.floor((Date.now() - startTime) / 1000))

    // Mise à jour chaque seconde
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="text-2xl font-bold text-yellow-900 text-center mt-2">
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}

interface Audit {
  id: number
  status: string
  start_date: string
  end_date: string
  chains: string[]
  total_transactions: number
  total_volume_usd: number
  total_gains_usd: number
  total_losses_usd: number
  total_fees_usd: number
  short_term_gains: number
  long_term_gains: number
  ordinary_income: number
  protocols_used: Record<string, any>
  created_at: string
  completed_at: string | null
  // Multi-currency fields
  local_currency?: string | null
  currency_symbol?: string | null
  total_volume_local?: number | null
  total_gains_local?: number | null
  total_losses_local?: number | null
  total_fees_local?: number | null
  exchange_rate?: number | null
}

// Detect blockchain type from wallet address
function detectChainTypeFromAddress(address: string): 'evm' | 'solana' | 'bitcoin' | 'other' {
  const addr = address.trim()

  // EVM addresses (0x...)
  if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return 'evm'
  }

  // Solana (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
    return 'solana'
  }

  // Bitcoin formats
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr) ||
      /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr) ||
      /^bc1[a-z0-9]{39,59}$/i.test(addr)) {
    return 'bitcoin'
  }

  return 'other'
}

export default function DeFiAuditPage() {
  const { user, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [audits, setAudits] = useState<Audit[]>([])
  const [isLoadingAudits, setIsLoadingAudits] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create audit form
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedChains, setSelectedChains] = useState<string[]>(['ethereum'])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Major Networks', 'Layer 2s'])
  const [detectedChainType, setDetectedChainType] = useState<string | null>(null)

  const availableChains = [
    // Major Networks
    { id: 'ethereum', name: 'Ethereum', status: 'active', category: 'Major Networks' },
    { id: 'polygon', name: 'Polygon', status: 'active', category: 'Major Networks' },
    { id: 'bsc', name: 'Binance Smart Chain (BSC)', status: 'active', category: 'Major Networks' },
    { id: 'avalanche', name: 'Avalanche', status: 'active', category: 'Major Networks' },
    { id: 'fantom', name: 'Fantom', status: 'active', category: 'Major Networks' },
    { id: 'solana', name: 'Solana', status: 'active', category: 'Major Networks' },

    // Layer 2s - Popular
    { id: 'arbitrum', name: 'Arbitrum', status: 'active', category: 'Layer 2s' },
    { id: 'arbitrum-nova', name: 'Arbitrum Nova', status: 'active', category: 'Layer 2s' },
    { id: 'optimism', name: 'Optimism', status: 'active', category: 'Layer 2s' },
    { id: 'base', name: 'Base', status: 'active', category: 'Layer 2s' },
    { id: 'blast', name: 'Blast', status: 'active', category: 'Layer 2s' },
    { id: 'scroll', name: 'Scroll', status: 'active', category: 'Layer 2s' },
    { id: 'zksync', name: 'zkSync Era', status: 'active', category: 'Layer 2s' },
    { id: 'linea', name: 'Linea', status: 'active', category: 'Layer 2s' },
    { id: 'mantle', name: 'Mantle', status: 'active', category: 'Layer 2s' },
    { id: 'taiko', name: 'Taiko', status: 'active', category: 'Layer 2s' },

    // Emerging Chains
    { id: 'abstract', name: 'Abstract', status: 'beta', category: 'Emerging Chains' },
    { id: 'apechain', name: 'ApeChain', status: 'beta', category: 'Emerging Chains' },
    { id: 'berachain', name: 'Berachain', status: 'beta', category: 'Emerging Chains' },
    { id: 'fraxtal', name: 'Fraxtal', status: 'active', category: 'Emerging Chains' },
    { id: 'sei', name: 'Sei', status: 'active', category: 'Emerging Chains' },
    { id: 'sonic', name: 'Sonic', status: 'beta', category: 'Emerging Chains' },
    { id: 'sophon', name: 'Sophon', status: 'beta', category: 'Emerging Chains' },
    { id: 'unichain', name: 'Unichain', status: 'beta', category: 'Emerging Chains' },
    { id: 'world', name: 'World Chain', status: 'beta', category: 'Emerging Chains' },

    // Others
    { id: 'cronos', name: 'Cronos', status: 'active', category: 'Others' },
    { id: 'gnosis', name: 'Gnosis', status: 'active', category: 'Others' },
    { id: 'celo', name: 'Celo', status: 'active', category: 'Others' },
    { id: 'moonbeam', name: 'Moonbeam', status: 'active', category: 'Others' },
    { id: 'moonriver', name: 'Moonriver', status: 'active', category: 'Others' },

    // Testnets (collapsed by default)
    { id: 'sepolia', name: 'Sepolia Testnet', status: 'active', category: 'Testnets' },
    { id: 'holesky', name: 'Holesky Testnet', status: 'active', category: 'Testnets' },
    { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', status: 'active', category: 'Testnets' },
    { id: 'optimism-sepolia', name: 'Optimism Sepolia', status: 'active', category: 'Testnets' },
    { id: 'base-sepolia', name: 'Base Sepolia', status: 'active', category: 'Testnets' },
    { id: 'polygon-amoy', name: 'Polygon Amoy', status: 'active', category: 'Testnets' },
    { id: 'avalanche-fuji', name: 'Avalanche Fuji', status: 'active', category: 'Testnets' }
  ]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && token) {
      fetchAudits()
    }
  }, [user, token])

  // Auto-refresh toutes les 5 secondes s'il y a des audits en "processing"
  useEffect(() => {
    const hasProcessing = audits.some(audit => audit.status === 'processing')

    if (hasProcessing && user && token) {
      const interval = setInterval(() => {
        fetchAudits()
      }, 5000) // 5 secondes

      return () => clearInterval(interval)
    }
  }, [audits, user, token])

  const fetchAudits = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/defi/audits`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audits')
      }

      const data = await response.json()
      setAudits(data)
    } catch (error: any) {
      showToast(error.message || 'Failed to load audits', 'error')
    } finally {
      setIsLoadingAudits(false)
    }
  }

  const handleCreateAudit = async () => {
    if (!walletAddress.trim()) {
      showToast('Wallet address is required', 'error')
      return
    }

    if (selectedChains.length === 0) {
      showToast('Select at least one blockchain', 'error')
      return
    }

    setIsCreating(true)

    try {
      const requestBody: any = {
        wallet_address: walletAddress,
        chains: selectedChains
      }

      // Add dates if provided
      if (startDate) {
        requestBody.start_date = new Date(startDate).toISOString()
      }
      if (endDate) {
        requestBody.end_date = new Date(endDate).toISOString()
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/defi/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create audit')
      }

      const data = await response.json()

      // Track DeFi audit
      if (user) {
        const blockchain = selectedChains.join(', ')
        const transactionCount = data.transaction_count || 0
        trackDeFiAudit(user.id.toString(), blockchain, transactionCount)
      }

      showToast('DeFi audit created! Processing transactions...', 'success')
      setShowCreateModal(false)
      setWalletAddress('')
      setSelectedChains(['ethereum'])
      setStartDate('')
      setEndDate('')
      setDetectedChainType(null)
      await fetchAudits()
    } catch (error: any) {
      showToast(error.message || 'Failed to create audit', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const toggleChain = (chainId: string) => {
    if (selectedChains.includes(chainId)) {
      setSelectedChains(selectedChains.filter(c => c !== chainId))
    } else {
      setSelectedChains([...selectedChains, chainId])
    }
  }

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const categories = ['Major Networks', 'Layer 2s', 'Emerging Chains', 'Others', 'Testnets']

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (isLoading || isLoadingAudits) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                  DeFi Audit
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Analyze your DeFi activity and calculate tax implications
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium shadow-sm"
                >
                  <span>⚠️ BETA</span>
                  <span>This feature is in beta testing</span>
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                New Audit
              </motion.button>
            </div>
          </motion.div>

          {/* Audits List */}
          {audits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                📊
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No audits yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Create your first DeFi audit to analyze your on-chain activity and calculate tax implications
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create First Audit
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 gap-6"
            >
              {audits.map((audit, index) => (
                <motion.div
                  key={audit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Audit #{audit.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            audit.status === 'completed'
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300'
                              : audit.status === 'processing'
                              ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300'
                              : 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-rose-300'
                          }`}
                        >
                          {audit.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {formatDate(audit.start_date)} - {formatDate(audit.end_date)}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {audit.chains.map((chain) => (
                          <span
                            key={chain}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600"
                          >
                            {chain}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TIMER ÉNORME pour processing */}
                    {audit.status === 'processing' && (
                      <div className="flex flex-col items-end gap-3">
                        <div className="px-8 py-4 bg-yellow-300 border-4 border-yellow-600 rounded-xl shadow-2xl">
                          <div className="text-5xl font-black text-yellow-900">⏱️ PROCESSING...</div>
                          <ProcessingTimer createdAt={audit.created_at} />
                        </div>

                        {/* BOUTON DELETE */}
                        <button
                          onClick={async () => {
                            if (confirm(`Delete audit #${audit.id}?`)) {
                              try {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/defi/audit/${audit.id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${token}` }
                                })
                                if (response.ok) {
                                  showToast('Audit deleted', 'success')
                                  fetchAudits()
                                } else {
                                  showToast('Failed to delete audit', 'error')
                                }
                              } catch (error) {
                                showToast('Failed to delete audit', 'error')
                              }
                            }
                          }}
                          className="px-6 py-3 bg-white border-4 border-red-600 rounded-xl shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">🗑️</span>
                            <span className="text-xl font-bold text-red-600">DELETE</span>
                          </div>
                        </button>

                        <Activity className="w-8 h-8 text-violet-600 animate-pulse" />
                      </div>
                    )}

                    {audit.status === 'completed' && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/defi-audit/${audit.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-xl hover:shadow-lg transition-all text-sm font-semibold group"
                        >
                          View Report
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {audit.status === 'completed' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border border-violet-100 dark:border-violet-900/50">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                          Transactions
                        </p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                          {audit.total_transactions}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900/50">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium flex items-center gap-2">
                          Volume
                          {audit.local_currency && <CurrencyBadge currencyCode={audit.local_currency} currencySymbol={audit.currency_symbol} />}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          <CurrencyDisplay
                            amountUsd={audit.total_volume_usd}
                            amountLocal={audit.total_volume_local}
                            currencyData={parseCurrencyData(audit)}
                            mode="dual"
                          />
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/50">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                          Net Gains
                        </p>
                        <p className={`text-2xl font-bold ${
                          audit.total_gains_usd - audit.total_losses_usd > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          <CurrencyDisplay
                            amountUsd={audit.total_gains_usd - audit.total_losses_usd}
                            amountLocal={audit.total_gains_local && audit.total_losses_local ? audit.total_gains_local - audit.total_losses_local : null}
                            currencyData={parseCurrencyData(audit)}
                            mode="dual"
                            showPlusSign={true}
                          />
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/50">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                          Total Fees
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          <CurrencyDisplay
                            amountUsd={audit.total_fees_usd}
                            amountLocal={audit.total_fees_local}
                            currencyData={parseCurrencyData(audit)}
                            mode="dual"
                          />
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Create Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => {
                  setShowCreateModal(false)
                  setWalletAddress('')
                  setSelectedChains(['ethereum'])
                  setStartDate('')
                  setEndDate('')
                  setDetectedChainType(null)
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      Create DeFi Audit
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Wallet Address *
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => {
                          const address = e.target.value
                          setWalletAddress(address)

                          // Auto-detect and pre-select appropriate chains
                          if (address.length >= 26) {
                            const chainType = detectChainTypeFromAddress(address)
                            setDetectedChainType(chainType)

                            if (chainType === 'evm') {
                              // For EVM, auto-select all major EVM chains
                              const evmChains = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base', 'avalanche']
                              setSelectedChains(evmChains)
                            } else if (chainType === 'solana') {
                              // For Solana, just select solana
                              setSelectedChains(['solana'])
                            }
                            // For bitcoin and other, no auto-selection (not supported in DeFi audit)
                          } else {
                            setDetectedChainType(null)
                          }
                        }}
                        placeholder="0x..., 7xKXtg..., etc."
                        className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-800 dark:text-white transition-all"
                      />
                      {detectedChainType && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-2"
                        >
                          {detectedChainType === 'evm' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300 rounded-lg text-xs font-semibold">
                              ✓ EVM address detected - 7 blockchains auto-selected
                            </span>
                          )}
                          {detectedChainType === 'solana' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-pink-300 rounded-lg text-xs font-semibold">
                              ✓ Solana address detected - blockchain auto-selected
                            </span>
                          )}
                          {detectedChainType === 'bitcoin' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                              ⚠️ Bitcoin address (not supported in DeFi audit)
                            </span>
                          )}
                          {detectedChainType === 'other' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                              ⚠️ Unknown address format
                            </span>
                          )}
                        </motion.div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Blockchain will be automatically detected and selected below
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Start Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-800 dark:text-white transition-all"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Leave empty to scan from genesis
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-800 dark:text-white transition-all"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Leave empty to scan until today
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Blockchains ({selectedChains.length} selected - auto-detected)
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Blockchains are automatically selected based on your address. You can adjust the selection if needed.
                      </p>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {categories.map((category) => {
                          const categoryChains = availableChains.filter(c => c.category === category)
                          const isExpanded = expandedCategories.includes(category)

                          return (
                            <motion.div
                              key={category}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-950/30 dark:hover:to-fuchsia-950/30 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-slate-900 dark:text-white">
                                    {category}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1 bg-white dark:bg-slate-900 rounded-full">
                                    {categoryChains.length} chains
                                  </span>
                                </div>
                                <ChevronDown
                                  className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50">
                                      {categoryChains.map((chain) => (
                                        <motion.label
                                          key={chain.id}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="flex items-center gap-3 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-violet-400 dark:hover:border-fuchsia-600 hover:bg-white dark:hover:bg-slate-900 transition-all"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedChains.includes(chain.id)}
                                            onChange={() => toggleChain(chain.id)}
                                            className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                          />
                                          <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                              {chain.name}
                                            </span>
                                            {chain.status === 'beta' && (
                                              <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold">
                                                Beta
                                              </span>
                                            )}
                                          </div>
                                        </motion.label>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        <strong>⚠️ Beta Feature:</strong> DeFi audit is currently in beta.
                        Transaction parsing may be incomplete. Always verify results with a tax professional.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCreateModal(false)
                        setWalletAddress('')
                        setSelectedChains(['ethereum'])
                        setStartDate('')
                        setEndDate('')
                        setDetectedChainType(null)
                      }}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold"
                      disabled={isCreating}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateAudit}
                      disabled={isCreating}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creating...' : 'Create Audit'}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </>
  )
}
