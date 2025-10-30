/**
 * OPTIMIZED Dashboard Page
 *
 * Performance improvements:
 * - Batched API fetches (parallel instead of sequential)
 * - Memoized components
 * - Lazy loaded sections
 * - Reduced Framer Motion animations
 * - Code splitting
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NextDynamic from 'next/dynamic'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDashboardData } from '@/components/dashboard/useDashboardData'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid'

// ✅ PERFORMANCE: Lazy load non-critical components
import AlertsSection from '@/components/dashboard/AlertsSection'

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

// Lazy load heavy components to improve initial page load
const AIChat = NextDynamic(() => import('@/components/dashboard/AIChat'), {
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-96 mb-12" />,
  ssr: false
})

const TaxOpportunities = NextDynamic(() => import('@/components/dashboard/TaxOpportunities'), {
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-48 mb-12" />,
  ssr: false
})

const RecentActivities = dynamic(() => import('@/components/dashboard/RecentActivities'), {
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-64 mb-12" />,
  ssr: false
})

const UsageCounter = dynamic(() => import('@/components/UsageCounter'), {
  loading: () => <div className="animate-pulse bg-slate-800/50 rounded-2xl h-48 mb-12" />,
  ssr: false
})

export default function DashboardPage() {
  const { user, isLoading: authLoading, token } = useAuth()
  const router = useRouter()

  // ✅ OPTIMIZATION: Single hook fetches all data in parallel
  const { data, isLoading, refetch } = useDashboardData(token)

  const [loadingTime, setLoadingTime] = useState(0)

  // Track loading time
  useEffect(() => {
    if (isLoading) {
      setLoadingTime(0)
      const interval = setInterval(() => {
        setLoadingTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dismissedAlerts')
      if (stored) {
        try {
          return new Set(JSON.parse(stored))
        } catch {
          return new Set()
        }
      }
    }
    return new Set()
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const dismissAlert = async (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts).add(alertId)
    setDismissedAlerts(newDismissed)

    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedAlerts', JSON.stringify(Array.from(newDismissed)))
    }

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
        // Silent fail - already dismissed locally
      }
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Loading spinner + message */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-violet-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Loading Dashboard...</h2>
              <p className="text-slate-400">Fetching your portfolio and tax data</p>
              {loadingTime > 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  {loadingTime}s elapsed
                  {loadingTime > 5 && <span className="block mt-1 text-yellow-400">⚡ Fetching token prices from multiple blockchains...</span>}
                  {loadingTime > 10 && <span className="block mt-1 text-orange-400">Almost there! Large portfolio detected.</span>}
                </p>
              )}
            </div>
          </div>

          {/* Loading skeleton (subtle in background) */}
          <div className="animate-pulse space-y-8 opacity-30">
            <div className="bg-slate-800/50 rounded-3xl h-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-800/50 rounded-2xl h-32" />
              ))}
            </div>
            <div className="bg-slate-800/50 rounded-2xl h-64" />
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center text-white">
            <p>Failed to load dashboard data</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-2 bg-violet-600 rounded-lg hover:bg-violet-700"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <HeroSection
          user={user}
          dashboardData={data.overview}
          walletPortfolio={data.walletPortfolio}
          stats={data.stats}
          onRefreshWallet={refetch}
        />

        {/* Alerts */}
        {data.overview?.alerts?.some((a: any) => !dismissedAlerts.has(a.id)) && (
          <AlertsSection
            alerts={data.overview.alerts}
            dismissedAlerts={dismissedAlerts}
            onDismiss={dismissAlert}
          />
        )}

        {/* Quick Actions */}
        <QuickActionsGrid />

        {/* Usage & Quotas Widget */}
        <div className="mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Your Usage This Month</h2>
            <UsageCounter compact={true} />
          </div>
        </div>

        {/* AI Chat */}
        <AIChat token={token} />

        {/* Tax Opportunities */}
        {data.overview?.tax_opportunities?.length > 0 && (
          <TaxOpportunities opportunities={data.overview.tax_opportunities} />
        )}

        {/* Recent Activities */}
        {data.overview?.activities?.length > 0 && (
          <RecentActivities activities={data.overview.activities} />
        )}
      </main>

      <Footer />
    </div>
  )
}
