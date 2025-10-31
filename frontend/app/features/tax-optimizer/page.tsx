'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, DollarSign } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'

export default function TaxOptimizerPage() {
  return (
    <PublicPageSSR>
      <section className="relative bg-gradient-to-b from-amber-50 via-orange-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="text-slate-900 dark:text-white">Tax Optimizer</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">AI-Powered Loss Harvesting</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Identify tax-loss harvesting opportunities and long-term gains timing. Maximize deductions and minimize tax liability.
          </p>
          <Link href="/tax-optimizer" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            Find Opportunities
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
      </PublicPageSSR>
  )
}
