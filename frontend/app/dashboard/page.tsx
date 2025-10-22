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
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDashboardData } from '@/components/dashboard/useDashboardData'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid'

// ✅ PERFORMANCE: Lazy load heavy sections
import dynamic from 'next/dynamic'

const AlertsSection = dynamic(() => import('@/components/dashboard/AlertsSection'), {
  loading: () => <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
})

const AIChat = dynamic(() => import('@/components/dashboard/AIChat'), {
  loading: () => <div className="h-96 bg-slate-800/50 rounded-xl animate-pulse" />
})

const TaxOpportunities = dynamic(() => import('@/components/dashboard/TaxOpportunities'), {
  loading: () => <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />
})

const RecentActivities = dynamic(() => import('@/components/dashboard/RecentActivities'), {
  loading: () => <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
})

export default function DashboardPage() {
  const { user, isLoading: authLoading, token } = useAuth()
  const router = useRouter()

  // ✅ OPTIMIZATION: Single hook fetches all data in parallel
  const { data, isLoading, refetch } = useDashboardData(token)

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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
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
