'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react'

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
  created_at: string
  completed_at: string | null
}

interface AuditSelectorProps {
  selectedAuditId: number | null
  onAuditChange: (auditId: number | null) => void
  className?: string
}

export function AuditSelector({
  selectedAuditId,
  onAuditChange,
  className = ''
}: AuditSelectorProps) {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudits()
  }, [])

  const fetchAudits = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/defi/audits`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Only show completed audits
        const completedAudits = data.filter((audit: Audit) => audit.status === 'completed')
        setAudits(completedAudits)
      }
    } catch (error) {
      console.error('Failed to fetch audits:', error)
    } finally {
      setLoading(false)
    }
  }

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const selectedAudit = audits.find(a => a.id === selectedAuditId)

  // Get display text for selected value
  const getDisplayText = (auditId: number | null) => {
    if (auditId === null) {
      return "✨ All Portfolios (Global Analysis)"
    }
    const audit = audits.find(a => a.id === auditId)
    if (!audit) return "Select audit..."
    return `📄 Audit #${audit.id} - ${formatDate(audit.start_date)} (${audit.total_transactions} txs)`
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-10 w-64 rounded-xl"></div>
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className={`text-sm text-slate-600 dark:text-slate-400 ${className}`}>
        No DeFi audits found. Create one to analyze specific audits.
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Instructions Banner */}
      <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-950/50 dark:to-fuchsia-950/50 border-2 border-violet-300 dark:border-violet-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-violet-900 dark:text-violet-100 mb-1">
              📊 Analyze Specific DeFi Audit or Global Portfolio
            </h3>
            <p className="text-sm text-violet-800 dark:text-violet-200 mb-2">
              Choose a specific audit below to see tax opportunities for that period only, or select "All Portfolios" to analyze your entire portfolio (including manual entries).
            </p>
            <div className="text-xs text-violet-700 dark:text-violet-300">
              <strong>Note:</strong> Only audits with transactions will show opportunities. Empty audits won't generate tax optimization suggestions.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white dark:text-white flex items-center gap-2 bg-violet-600 dark:bg-violet-700 px-4 py-2 rounded-lg">
          <FileText className="w-4 h-4" />
          Select Portfolio Scope:
        </label>
        <Select
          value={selectedAuditId?.toString() || 'all'}
          onValueChange={(value) => {
            onAuditChange(value === 'all' ? null : parseInt(value))
          }}
        >
          <SelectTrigger className="w-full md:w-[500px] h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-lg transition-all cursor-pointer font-medium">
            <SelectValue placeholder={getDisplayText(selectedAuditId)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-semibold">✨ All Portfolios (Recommended)</span>
              </div>
            </SelectItem>
            <div className="px-2 py-1 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 mt-1">
              Your DeFi Audits:
            </div>
            {audits.map((audit) => {
              const isEmpty = audit.total_transactions === 0
              return (
                <SelectItem key={audit.id} value={audit.id.toString()} disabled={isEmpty}>
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${isEmpty ? 'text-slate-400' : 'text-violet-600'}`} />
                    <div className="flex flex-col">
                      <span className={`font-medium ${isEmpty ? 'text-slate-400' : ''}`}>
                        Audit #{audit.id} {isEmpty && '(Empty)'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(audit.start_date)} - {formatDate(audit.end_date)}
                      </span>
                    </div>
                    <Badge
                      variant="neutral"
                      className={`text-xs ${isEmpty ? 'bg-slate-100 text-slate-500' : ''}`}
                    >
                      {audit.total_transactions} txs
                    </Badge>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Audit Info */}
      <AnimatePresence>
        {selectedAudit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Audit #{selectedAudit.id} Details
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Analyzing opportunities from this specific audit
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {selectedAudit.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Period</p>
                    <p className="text-sm font-semibold">
                      {formatDate(selectedAudit.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Transactions</p>
                    <p className="text-sm font-semibold">{selectedAudit.total_transactions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Volume</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(selectedAudit.total_volume_usd)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Net G/L</p>
                    <p className={`text-sm font-semibold ${
                      selectedAudit.total_gains_usd - selectedAudit.total_losses_usd > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(selectedAudit.total_gains_usd - selectedAudit.total_losses_usd)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-800">
                <div className="flex flex-wrap gap-2">
                  {selectedAudit.chains.map((chain) => (
                    <Badge
                      key={chain}
                      variant="neutral"
                      className="text-xs bg-white dark:bg-slate-800"
                    >
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
