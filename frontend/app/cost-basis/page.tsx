'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { 
  Plus, Upload, Download, Edit2, Trash2, 
  Filter, TrendingUp, TrendingDown, DollarSign,
  Calendar, Database, Info
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading cost basis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cost Basis Tracking
          </h1>
          <p className="text-gray-400">
            Track your cryptocurrency purchase history for accurate tax calculations
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Lots</span>
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{filteredLots.length}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Cost Basis</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold">${totalCostBasis.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Unique Tokens</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">
              {Object.keys(portfolioSummary).length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Cost Basis</span>
              <TrendingDown className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold">
              ${totalAmount > 0 ? (totalCostBasis / totalAmount).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Lot Manually
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Upload className="w-5 h-5" />
            Import CSV
          </button>

          <button
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setViewMode('lots')}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'lots' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Lots View
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'summary' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Summary View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 mb-6 flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-semibold">Filters:</span>
          </div>
          
          <input
            type="text"
            placeholder="Token symbol..."
            value={filterToken}
            onChange={(e) => setFilterToken(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white flex-1"
          />

          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
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
            <button
              onClick={() => { setFilterToken(''); setFilterChain('') }}
              className="text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Content */}
        {viewMode === 'lots' ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Token</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Chain</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Cost Basis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Acquired</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Method</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No cost basis lots found</p>
                        <p className="text-sm">Add lots manually or import from CSV</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLots.map((lot) => (
                      <tr key={lot.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{lot.token}</span>
                            {lot.manually_added && (
                              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                                Manual
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 capitalize">{lot.chain}</td>
                        <td className="px-6 py-4 text-right">
                          <div>
                            <p className="font-semibold">{lot.remaining_amount.toLocaleString()}</p>
                            {lot.disposed_amount > 0 && (
                              <p className="text-xs text-gray-500">
                                ({lot.disposed_amount} disposed)
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div>
                            <p className="font-semibold">
                              ${(lot.remaining_amount * lot.acquisition_price_usd).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </p>
                            <p className="text-xs text-gray-500">
                              @ ${lot.acquisition_price_usd.toLocaleString(undefined, {maximumFractionDigits: 4})}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(lot.acquisition_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded capitalize">
                            {lot.acquisition_method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingLot(lot)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLot(lot.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(portfolioSummary).map(([key, summary]) => (
              <div key={key} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{summary.token}</h3>
                    <p className="text-sm text-gray-400 capitalize">{summary.chain}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-lg font-semibold">{summary.total_amount.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Total Cost Basis</p>
                    <p className="text-lg font-semibold">
                      ${summary.total_cost_basis.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Avg Cost Basis</p>
                    <p className="text-lg font-semibold text-purple-400">
                      ${summary.avg_cost_basis.toLocaleString(undefined, {maximumFractionDigits: 4})}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Lots</p>
                    <p className="text-lg font-semibold">{summary.lots_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Alert */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Cost Basis Tracking</p>
            <p>
              Accurate cost basis tracking is essential for calculating capital gains and losses. 
              Import your purchase history from exchanges or add lots manually. The system supports 
              FIFO, LIFO, and HIFO methods for tax optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Add Lot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">Add Cost Basis Lot</h2>
            </div>

            <form onSubmit={handleAddLot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Token Symbol</label>
                  <input
                    type="text"
                    required
                    value={formData.token}
                    onChange={(e) => setFormData({...formData, token: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                    placeholder="ETH, BTC, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Chain</label>
                  <select
                    value={formData.chain}
                    onChange={(e) => setFormData({...formData, chain: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
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
                  <label className="block text-sm font-semibold mb-2">Amount</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Purchase Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.acquisition_price_usd}
                    onChange={(e) => setFormData({...formData, acquisition_price_usd: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Acquisition Date</label>
                  <input
                    type="date"
                    required
                    value={formData.acquisition_date}
                    onChange={(e) => setFormData({...formData, acquisition_date: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Acquisition Method</label>
                  <select
                    value={formData.acquisition_method}
                    onChange={(e) => setFormData({...formData, acquisition_method: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
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
                <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white h-24"
                  placeholder="Additional notes about this acquisition..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Add Lot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">Import Cost Basis from CSV</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-200 mb-2">
                  <strong>CSV Format:</strong> token,chain,amount,acquisition_price_usd,acquisition_date,acquisition_method
                </p>
                <p className="text-xs text-blue-300">
                  Example: ETH,ethereum,10.5,2500.00,2023-01-15,purchase
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImportCSV(e.target.files[0])
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                />
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
