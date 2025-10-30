'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, LineChart } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function WalletPortfolioPage() {
  return (
    <PublicPageLayout>
      <section className="relative bg-gradient-to-b from-indigo-50 via-purple-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="text-slate-900 dark:text-white">Wallet Portfolio Tracking</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Historical Charts & Positions</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Track your holdings across all wallets with historical charts (7d/30d/90d/1y), 24h change tracking, and automatic position breakdown.
          </p>
          <Link href="/wallets" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            View Portfolio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      </PublicPageLayout>
  )
}
