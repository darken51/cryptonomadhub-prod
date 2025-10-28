'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { ArrowLeft, Download, ExternalLink, RefreshCw, Clock, Loader2, Trash2 } from 'lucide-react'

interface AuditReport {
  audit_id: number
  status: string
  period: {
    start: string
    end: string
  }
  chains: string[]
  summary: {
    total_transactions: number
    total_volume_usd: number
    total_gains_usd: number
    total_losses_usd: number
    total_fees_usd: number
    short_term_gains: number
    long_term_gains: number
    ordinary_income: number
  }
  protocols_used: Record<string, { transactions: number; volume_usd: number }>
  transactions?: Array<{
    hash: string
    timestamp: string
    type: string
    protocol: string
    chain: string
    value_usd: number
    gain_loss_usd: number
    fee_usd: number
  }>
  recommendations?: string[]
}

export default function AuditReportPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const auditId = params.id as string

  const [report, setReport] = useState<AuditReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Timer for elapsed time when processing
  useEffect(() => {
    if (report?.status === 'processing') {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [report?.status])

  // Auto-refresh when processing
  useEffect(() => {
    if (report?.status === 'processing') {
      pollingIntervalRef.current = setInterval(() => {
        fetchReport(true) // Silent refresh
      }, 5000) // Poll every 5 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    } else if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [report?.status])

  useEffect(() => {
    if (user && token && auditId) {
      fetchReport()
    }
  }, [user, token, auditId])

  const fetchReport = async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/defi/audit/${auditId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch audit report')
      }

      const data = await response.json()
      setReport(data)
    } catch (error: any) {
      if (!silent) {
        showToast(error.message || 'Failed to load audit report', 'error')
        router.push('/defi-audit')
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const deleteAudit = async () => {
    if (!confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/defi/audit/${auditId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete audit')
      }

      showToast('Audit deleted successfully', 'success')
      router.push('/defi-audit')
    } catch (error: any) {
      showToast(error.message || 'Failed to delete audit', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
      </div>
    )
  }

  if (!user || !report) {
    return null
  }

  const netGainLoss = report.summary.total_gains_usd - report.summary.total_losses_usd

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/defi-audit"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Audits
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Audit Report #{report.audit_id}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {formatDate(report.period.start)} - {formatDate(report.period.end)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {report.chains.map((chain) => (
                  <span
                    key={chain}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {report.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatElapsedTime(elapsedTime)}</span>
                </div>
              )}

              <button
                onClick={() => fetchReport()}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={deleteAudit}
                disabled={isDeleting}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="Delete audit"
              >
                <Trash2 className={`w-4 h-4 text-red-600 dark:text-red-400 ${isDeleting ? 'opacity-50' : ''}`} />
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/defi/audit/${auditId}/export/csv`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      }
                    )

                    if (!response.ok) {
                      throw new Error('Failed to download CSV')
                    }

                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `audit-report-${auditId}.csv`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                    showToast('CSV exported successfully', 'success')
                  } catch (error: any) {
                    showToast(error.message || 'Failed to download CSV', 'error')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/defi/audit/${auditId}/export/pdf`,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      }
                    )

                    if (!response.ok) {
                      throw new Error('Failed to download PDF')
                    }

                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `audit-report-${auditId}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                    showToast('PDF exported successfully', 'success')
                  } catch (error: any) {
                    showToast(error.message || 'Failed to download PDF', 'error')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Transactions
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.summary.total_transactions}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Volume
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(report.summary.total_volume_usd)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Net Gain/Loss
            </p>
            <p
              className={`text-3xl font-bold ${
                netGainLoss >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(netGainLoss)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Fees Paid
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(report.summary.total_fees_usd)}
            </p>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Tax Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Short-term Capital Gains
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(report.summary.short_term_gains)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Held &lt; 1 year
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Long-term Capital Gains
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(report.summary.long_term_gains)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Held ≥ 1 year
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ordinary Income
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(report.summary.ordinary_income)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Staking, rewards, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Volume Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Volume Breakdown
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Chain */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                By Chain
              </h3>
              <div className="space-y-2">
                {report.chains.map((chain) => {
                  const chainVolume = report.transactions
                    ?.filter((tx) => tx.chain.toLowerCase() === chain.toLowerCase())
                    .reduce((sum, tx) => sum + (tx.value_usd || 0), 0) || 0
                  const percentage = report.summary.total_volume_usd > 0
                    ? (chainVolume / report.summary.total_volume_usd * 100).toFixed(1)
                    : 0

                  return (
                    <div key={chain} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {chain}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(chainVolume)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By Transaction Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                By Transaction Type
              </h3>
              <div className="space-y-2">
                {report.transactions && (() => {
                  const typeVolumes: Record<string, number> = {}
                  report.transactions.forEach((tx) => {
                    const type = tx.type || 'unknown'
                    typeVolumes[type] = (typeVolumes[type] || 0) + (tx.value_usd || 0)
                  })

                  return Object.entries(typeVolumes)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([type, volume]) => {
                      const percentage = report.summary.total_volume_usd > 0
                        ? (volume / report.summary.total_volume_usd * 100).toFixed(1)
                        : 0

                      return (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {type.replace(/_/g, ' ')}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(volume)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      )
                    })
                })()}
              </div>
            </div>

            {/* By Token */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                By Token (Top 5)
              </h3>
              <div className="space-y-2">
                {report.transactions && (() => {
                  const tokenVolumes: Record<string, number> = {}

                  // Collect volume from both token_in and token_out
                  report.transactions.forEach((tx: any) => {
                    // Token out (selling/sending)
                    if (tx.token_out && tx.amount_out) {
                      const token = tx.token_out
                      const volume = tx.value_usd || 0
                      tokenVolumes[token] = (tokenVolumes[token] || 0) + volume
                    }
                    // Token in (buying/receiving)
                    if (tx.token_in && tx.amount_in) {
                      const token = tx.token_in
                      const volume = tx.value_usd || 0
                      tokenVolumes[token] = (tokenVolumes[token] || 0) + volume
                    }
                  })

                  const entries = Object.entries(tokenVolumes)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)

                  if (entries.length === 0) {
                    return (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No token data available
                        </p>
                      </div>
                    )
                  }

                  return entries.map(([token, volume]) => {
                    const percentage = report.summary.total_volume_usd > 0
                      ? (volume / report.summary.total_volume_usd * 100).toFixed(1)
                      : 0

                    return (
                      <div key={token} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                          {token}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(volume)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {percentage}%
                          </p>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Protocols Used */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Protocols Used
          </h2>
          {Object.keys(report.protocols_used).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(report.protocols_used)
                .sort(([, a], [, b]) => b.transactions - a.transactions)
                .map(([protocol, data]) => (
                  <div
                    key={protocol}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {protocol}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {data.transactions} txs
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Volume: {formatCurrency(data.volume_usd)}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No protocol data available
            </p>
          )}
        </div>

        {/* Transactions */}
        {report.transactions && report.transactions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Protocol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chain
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fee
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {report.transactions.slice(0, 50).map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDateTime(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {tx.protocol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tx.chain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(tx.value_usd)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        tx.gain_loss_usd >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(tx.gain_loss_usd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(tx.fee_usd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong> This report is for informational purposes only and is NOT tax or financial advice.
              Always consult with a licensed tax professional before making decisions. Transaction categorization may be incomplete or incorrect.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>⚠️ Cost Basis Warning:</strong> Some transactions may not have accurate purchase prices (cost basis).
              When the cost basis is unknown, the system assumes $0 (worst case for tax purposes), which may significantly
              overstate your capital gains. Please verify with your actual purchase records and adjust calculations accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
