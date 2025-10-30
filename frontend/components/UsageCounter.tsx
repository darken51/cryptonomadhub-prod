'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  FileText,
  BarChart3,
  Shield,
  MessageSquare,
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  Database,
  Sparkles
} from 'lucide-react'

interface UsageData {
  tier: string
  status: string
  expires_at: string | null

  // Current usage
  simulations_used: number
  defi_audits_used: number
  pdf_exports_used: number
  chat_messages_used: number

  // Limits
  simulations_limit: number
  defi_audits_limit: number
  pdf_exports_limit: number
  chat_messages_limit: number
  wallets_limit: number
  cost_basis_tx_limit: number

  // Remaining
  simulations_remaining: number
  defi_audits_remaining: number
  pdf_exports_remaining: number
  chat_messages_remaining: number

  // Billing
  usage_reset_at: string
  next_billing_date: string | null
}

interface UsageCounterProps {
  compact?: boolean
}

export default function UsageCounter({ compact = false }: UsageCounterProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/license/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await response.json()
      setUsage(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (used: number, limit: number): string => {
    if (limit === 999999) return 'bg-purple-600' // Unlimited

    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 70) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  const getProgressPercentage = (used: number, limit: number): number => {
    if (limit === 999999) return 0 // Unlimited, show empty bar
    return Math.min((used / limit) * 100, 100)
  }

  const formatLimit = (limit: number): string => {
    if (limit === 999999) return '∞'
    return limit.toLocaleString()
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card variant="glass" className="animate-pulse">
        <CardContent>
          <div className="h-32 bg-slate-700/20 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usage) {
    return (
      <Card variant="glass">
        <CardContent>
          <p className="text-red-500">Failed to load usage data</p>
        </CardContent>
      </Card>
    )
  }

  const resources = [
    {
      name: 'Simulations',
      icon: BarChart3,
      used: usage.simulations_used,
      limit: usage.simulations_limit,
      remaining: usage.simulations_remaining,
      color: 'text-blue-500'
    },
    {
      name: 'DeFi Audits',
      icon: Shield,
      used: usage.defi_audits_used,
      limit: usage.defi_audits_limit,
      remaining: usage.defi_audits_remaining,
      color: 'text-purple-500'
    },
    {
      name: 'PDF Exports',
      icon: FileText,
      used: usage.pdf_exports_used,
      limit: usage.pdf_exports_limit,
      remaining: usage.pdf_exports_remaining,
      color: 'text-green-500'
    },
    {
      name: 'AI Chat Messages',
      icon: MessageSquare,
      used: usage.chat_messages_used,
      limit: usage.chat_messages_limit,
      remaining: usage.chat_messages_remaining,
      color: 'text-cyan-500'
    }
  ]

  // Compact view for dashboard widgets
  if (compact) {
    return (
      <div className="space-y-3">
        {resources.map((resource) => {
          const Icon = resource.icon
          const percentage = getProgressPercentage(resource.used, resource.limit)
          const isLow = percentage >= 70 && resource.limit !== 999999

          return (
            <div key={resource.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${resource.color}`} />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {resource.name}
                  </span>
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  {resource.used} / {formatLimit(resource.limit)}
                </span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(resource.used, resource.limit)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {isLow && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  ⚠️ {resource.remaining} remaining
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Full view for settings page
  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              Usage & Quotas
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Current plan: <span className="font-bold text-purple-600 dark:text-purple-400">
                {usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1)}
              </span>
            </p>
          </div>
          {usage.tier === 'free' && (
            <Link href="/pricing">
              <Button variant="primary" size="sm" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Monthly Resources */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Monthly Usage (Resets {formatDate(usage.usage_reset_at)})
          </h4>

          {resources.map((resource) => {
            const Icon = resource.icon
            const percentage = getProgressPercentage(resource.used, resource.limit)
            const isLow = percentage >= 70 && resource.limit !== 999999
            const isExceeded = percentage >= 100

            return (
              <div key={resource.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                      <Icon className={`w-5 h-5 ${resource.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {resource.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {resource.used.toLocaleString()} / {formatLimit(resource.limit)} used
                      </p>
                    </div>
                  </div>

                  {isExceeded ? (
                    <Link href="/pricing">
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                        Upgrade
                      </Button>
                    </Link>
                  ) : isLow ? (
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                      {resource.remaining} left
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-green-600 dark:text-green-500">
                      {formatLimit(resource.remaining)} left
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Progress value={percentage} className="h-3" />
                  <div
                    className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(resource.used, resource.limit)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Account Limits */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Account Limits
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Wallets</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {formatLimit(usage.wallets_limit)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Cost Basis Tx</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {formatLimit(usage.cost_basis_tx_limit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        {usage.next_billing_date && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Next billing date: <span className="font-medium text-slate-900 dark:text-white">
                {formatDate(usage.next_billing_date)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
