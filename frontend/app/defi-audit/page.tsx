'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react'

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
      showToast('DeFi audit created! Processing transactions...', 'success')
      setShowCreateModal(false)
      setWalletAddress('')
      setSelectedChains(['ethereum'])
      setStartDate('')
      setEndDate('')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                DeFi Audit
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analyze your DeFi activity and calculate tax implications
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                <span>⚠️ BETA</span>
                <span>This feature is in beta testing</span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Audit
            </button>
          </div>
        </div>

        {/* Audits List */}
        {audits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No audits yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first DeFi audit to analyze your on-chain activity
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create First Audit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Audit #{audit.id}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          audit.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : audit.status === 'processing'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {audit.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(audit.start_date)} - {formatDate(audit.end_date)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {audit.chains.map((chain) => (
                        <span
                          key={chain}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {chain}
                        </span>
                      ))}
                    </div>
                  </div>
                  {audit.status === 'completed' && (
                    <Link
                      href={`/defi-audit/${audit.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition text-sm"
                    >
                      View Report
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {audit.status === 'completed' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Transactions
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {audit.total_transactions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Volume
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(audit.total_volume_usd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Net Gains
                      </p>
                      <p className={`text-xl font-bold ${
                        audit.total_gains_usd - audit.total_losses_usd > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(audit.total_gains_usd - audit.total_losses_usd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Total Fees
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(audit.total_fees_usd)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create DeFi Audit
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the wallet address you want to audit
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty to scan from genesis
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty to scan until today
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Blockchains * ({selectedChains.length} selected)
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const categoryChains = availableChains.filter(c => c.category === category)
                      const isExpanded = expandedCategories.includes(category)

                      return (
                        <div key={category} className="border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {category}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({categoryChains.length} chains)
                              </span>
                            </div>
                            <svg
                              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {categoryChains.map((chain) => (
                                <label
                                  key={chain.id}
                                  className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedChains.includes(chain.id)}
                                    onChange={() => toggleChain(chain.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {chain.name}
                                    </span>
                                    {chain.status === 'beta' && (
                                      <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                                        Beta
                                      </span>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Beta Feature:</strong> DeFi audit is currently in beta.
                    Transaction parsing may be incomplete. Always verify results with a tax professional.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setWalletAddress('')
                    setSelectedChains(['ethereum'])
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAudit}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Audit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
