'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Upload, Download, Edit2, Trash2,
  Filter, TrendingUp, TrendingDown, DollarSign,
  Calendar, Database, Info, AlertTriangle, CheckCircle
} from 'lucide-react'

interface CostBasisLot {
  id: number
  token: string
  chain: string
  acquisition_date: string
  acquisition_method: string
  acquisition_price_usd: number
  original_amount: number
  remaining_amount: number
  disposed_amount: number
  manually_added: boolean
  verified: boolean
  notes?: string
  created_at: string
}

interface PortfolioSummary {
  [key: string]: {
    token: string
    chain: string
    total_amount: number
    total_cost_basis: number
    avg_cost_basis: number
    lots_count: number
  }
}

export default function CostBasisPage() {
  const { user, token, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [lots, setLots] = useState<CostBasisLot[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({})
  const [isLoadingLots, setIsLoadingLots] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingLot, setEditingLot] = useState<CostBasisLot | null>(null)

  // Filters
  const [filterToken, setFilterToken] = useState('')
  const [filterChain, setFilterChain] = useState('')
  const [viewMode, setViewMode] = useState<'lots' | 'summary'>('lots')

  // Form state
  const [formData, setFormData] = useState({
    token: '',
    chain: 'ethereum',
    amount: '',
    acquisition_price_usd: '',
    acquisition_date: '',
    acquisition_method: 'purchase',
    notes: ''
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (user && token) {
      fetchLots()
      fetchPortfolioSummary()
    }
  }, [user, isLoading, token, router])

  const fetchLots = async () => {
    setIsLoadingLots(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLots(data)
      } else {
        showToast('Failed to load cost basis lots', 'error')
      }
    } catch (error) {
      console.error('Error fetching lots:', error)
      showToast('Failed to load cost basis lots', 'error')
    } finally {
      setIsLoadingLots(false)
    }
  }

  const fetchPortfolioSummary = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolioSummary(data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    }
  }

  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          acquisition_price_usd: parseFloat(formData.acquisition_price_usd)
        })
      })

      if (response.ok) {
        showToast('Cost basis lot added successfully', 'success')
        setShowAddModal(false)
        setFormData({
          token: '',
          chain: 'ethereum',
          amount: '',
          acquisition_price_usd: '',
          acquisition_date: '',
          acquisition_method: 'purchase',
          notes: ''
        })
        fetchLots()
        fetchPortfolioSummary()
      } else {
        const error = await response.json()
        showToast(error.detail || 'Failed to add lot', 'error')
      }
    } catch (error) {
      console.error('Error adding lot:', error)
      showToast('Failed to add lot', 'error')
    }
  }

  const handleDeleteLot = async (lotId: number) => {
    if (!confirm('Are you sure you want to delete this lot?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/lots/${lotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showToast('Lot deleted successfully', 'success')
        fetchLots()
        fetchPortfolioSummary()
      } else {
        showToast('Failed to delete lot', 'error')
      }
    } catch (error) {
      console.error('Error deleting lot:', error)
      showToast('Failed to delete lot', 'error')
    }
  }

  const handleImportCSV = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cost-basis/import-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        showToast(`Imported ${result.imported} lots successfully`, 'success')
        setShowImportModal(false)
        fetchLots()
        fetchPortfolioSummary()
      } else {
        const error = await response.json()
        showToast(error.detail || 'Failed to import CSV', 'error')
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      showToast('Failed to import CSV', 'error')
    }
  }

  const filteredLots = lots.filter(lot => {
    if (filterToken && !lot.token.toLowerCase().includes(filterToken.toLowerCase())) return false
    if (filterChain && lot.chain !== filterChain) return false
    return true
  })

  const totalCostBasis = filteredLots.reduce((sum, lot) => 
    sum + (lot.remaining_amount * lot.acquisition_price_usd), 0
  )

  const totalAmount = filteredLots.reduce((sum, lot) => 
    sum + lot.remaining_amount, 0
  )

  if (isLoading || isLoadingLots) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-fuchsia-50 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-fuchsia-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading cost basis data...</p>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-fuchsia-50 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Cost Basis Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Track your cryptocurrency purchase history for accurate tax calculations
            </p>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Total Lots</span>
                <div className="p-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-violet-600 dark:text-fuchsia-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredLots.length}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Total Cost Basis</span>
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">${totalCostBasis.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Unique Tokens</span>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {Object.keys(portfolioSummary).length}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Avg Cost Basis</span>
                <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${totalAmount > 0 ? (totalCostBasis / totalAmount).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'}
              </p>
            </motion.div>
          </motion.div>

          {/* Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Lot Manually
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowImportModal(true)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Export
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/cost-basis/review')}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Review Unverified
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/cost-basis/wash-sales')}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <AlertTriangle className="w-5 h-5" />
              Wash Sales
            </motion.button>

            <div className="ml-auto flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('lots')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all shadow-md ${
                  viewMode === 'lots'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}
              >
                Lots View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('summary')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all shadow-md ${
                  viewMode === 'summary'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}
              >
                Summary View
              </motion.button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-violet-600 dark:text-fuchsia-400" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Filters:</span>
              </div>

              <input
                type="text"
                placeholder="Token symbol..."
                value={filterToken}
                onChange={(e) => setFilterToken(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white flex-1 min-w-[200px] focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
              />

              <select
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
              >
                <option value="">All Chains</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="bsc">BSC</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
                <option value="base">Base</option>
              </select>

              {(filterToken || filterChain) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setFilterToken(''); setFilterChain('') }}
                  className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 font-medium transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Content */}
          {viewMode === 'lots' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Token</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Chain</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Cost Basis</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Acquired</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Method</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Database className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No cost basis lots found</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add lots manually or import from CSV</p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      filteredLots.map((lot, index) => (
                        <motion.tr
                          key={lot.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">{lot.token}</span>
                              {lot.manually_added && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                  Manual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 capitalize">{lot.chain}</td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{lot.remaining_amount.toLocaleString()}</p>
                              {lot.disposed_amount > 0 && (
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  ({lot.disposed_amount} disposed)
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                ${(lot.remaining_amount * lot.acquisition_price_usd).toLocaleString(undefined, {maximumFractionDigits: 2})}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                @ ${lot.acquisition_price_usd.toLocaleString(undefined, {maximumFractionDigits: 4})}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                            {new Date(lot.acquisition_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full capitalize font-medium">
                              {lot.acquisition_method}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingLot(lot)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteLot(lot.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.entries(portfolioSummary).map(([key, summary], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white dark:bg-slate-900 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{summary.token}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{summary.chain}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl">
                      <DollarSign className="w-7 h-7 text-violet-600 dark:text-fuchsia-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.total_amount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Total Cost Basis</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        ${summary.total_cost_basis.toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Avg Cost Basis</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        ${summary.avg_cost_basis.toLocaleString(undefined, {maximumFractionDigits: 4})}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Lots</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.lots_count}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Info Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex gap-4 shadow-lg"
          >
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-2 text-base">Cost Basis Tracking</p>
              <p className="leading-relaxed">
                Accurate cost basis tracking is essential for calculating capital gains and losses.
                Import your purchase history from exchanges or add lots manually. The system supports
                FIFO, LIFO, and HIFO methods for tax optimization.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />

      {/* Add Lot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Add Cost Basis Lot
                </h2>
              </div>

              <form onSubmit={handleAddLot} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Token Symbol</label>
                    <input
                      type="text"
                      required
                      value={formData.token}
                      onChange={(e) => setFormData({...formData, token: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                      placeholder="ETH, BTC, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Chain</label>
                    <select
                      value={formData.chain}
                      onChange={(e) => setFormData({...formData, chain: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="bsc">BSC</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="base">Base</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Amount</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Purchase Price (USD)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.acquisition_price_usd}
                      onChange={(e) => setFormData({...formData, acquisition_price_usd: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Acquisition Date</label>
                    <input
                      type="date"
                      required
                      value={formData.acquisition_date}
                      onChange={(e) => setFormData({...formData, acquisition_date: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Acquisition Method</label>
                    <select
                      value={formData.acquisition_method}
                      onChange={(e) => setFormData({...formData, acquisition_method: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all"
                    >
                      <option value="purchase">Purchase</option>
                      <option value="mining">Mining</option>
                      <option value="staking">Staking Reward</option>
                      <option value="airdrop">Airdrop</option>
                      <option value="gift">Gift</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white h-24 focus:ring-2 focus:ring-violet-500 dark:focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none"
                    placeholder="Additional notes about this acquisition..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Add Lot
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import CSV Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Import Cost Basis from CSV
                </h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200 mb-2 font-semibold">
                    CSV Format: token,chain,amount,acquisition_price_usd,acquisition_date,acquisition_method
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    Example: ETH,ethereum,10.5,2500.00,2023-01-15,purchase
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImportCSV(e.target.files[0])
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 dark:file:bg-violet-900/30 file:text-violet-700 dark:file:text-violet-300 file:font-semibold hover:file:bg-violet-100 dark:hover:file:bg-violet-900/50 transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowImportModal(false)}
                  className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
