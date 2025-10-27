'use client'

import Link from 'next/link'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function DashboardFeaturePage() {
  return (
    <PublicPageLayout>
      <section className="relative bg-gradient-to-b from-rose-50 via-pink-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="text-slate-900 dark:text-white">Dashboard & Alerts</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Smart Notifications</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Central hub with portfolio stats, critical alerts, tax opportunities, and activity timeline. Never miss important deadlines.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            Open Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      </PublicPageLayout>
  )
}
