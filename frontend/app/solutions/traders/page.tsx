'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart3, Calculator, Activity, DollarSign, Shield, CheckCircle, LineChart, Zap, Target, Clock } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import { motion } from 'framer-motion'

export default function CryptoTradersPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "For Crypto Traders - Portfolio Tracking & Tax Optimization",
            "description": "Professional portfolio tracking, cost basis methods (FIFO/LIFO/HIFO), wash sale detection, tax loss harvesting, and Form 8949 export. 50+ chains including Solana DeFi.",
            "url": "https://cryptonomadhub.com/solutions/traders"
          })
        }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-emerald-50 via-teal-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold mb-6">
              <TrendingUp className="w-4 h-4" />
              FOR CRYPTO TRADERS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Trade Smart,</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Optimize Taxes
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Professional portfolio tracking with <strong>FIFO/LIFO/HIFO</strong> cost basis, <strong>wash sale detection</strong>, and <strong>tax loss harvesting</strong>. 50+ chains including Solana DeFi.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/wallets"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Track Your Portfolio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-teal-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Traders Choose Us */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Active Traders
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to track trades and minimize taxes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calculator,
                title: 'Cost Basis Methods',
                description: 'Choose FIFO, LIFO, or HIFO to optimize your tax strategy. Automatic calculation for every transaction across all wallets.',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Shield,
                title: 'Wash Sale Detection',
                description: '30-day wash sale rule tracking for crypto. Get alerts before triggering wash sales and adjust your trading strategy accordingly.',
                gradient: 'from-rose-500 to-pink-600'
              },
              {
                icon: DollarSign,
                title: 'Tax Loss Harvesting',
                description: 'AI identifies opportunities to sell losing positions for tax deductions. Offset gains and reduce your tax bill strategically.',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                icon: Activity,
                title: '50+ Chain Support',
                description: 'Track Ethereum, Solana, Polygon, Arbitrum, Optimism, Base, and more. Full DeFi protocol coverage (Uniswap, Aave, Jupiter, Raydium).',
                gradient: 'from-violet-500 to-purple-600'
              },
              {
                icon: LineChart,
                title: 'Real-Time Portfolio',
                description: 'Live portfolio value tracking across all wallets. Historical charts, P&L breakdowns, and performance analytics.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Target,
                title: 'Form 8949 Export',
                description: 'One-click IRS Form 8949 generation with complete transaction details. CSV/PDF export for your accountant or TurboTax.',
                gradient: 'from-indigo-500 to-blue-600'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Scenarios */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Every Trading Strategy Covered
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From day trading to DeFi farming - we handle it all
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Day Traders',
                description: 'High-frequency trading with hundreds of transactions per day. Automatic cost basis tracking with FIFO/LIFO, real-time P&L, and wash sale alerts.',
                challenge: 'Challenge: Complex cost basis calculations',
                solution: 'Solution: Automatic FIFO/LIFO/HIFO with instant updates'
              },
              {
                icon: '🌾',
                title: 'DeFi Farmers',
                description: 'Yield farming, liquidity providing, and reward harvesting across multiple protocols. Track Uniswap, Aave, Compound, Curve, Jupiter, Raydium automatically.',
                challenge: 'Challenge: Complex DeFi transactions',
                solution: 'Solution: 50+ protocol support with auto-detection'
              },
              {
                icon: '🖼️',
                title: 'NFT Traders',
                description: 'Buy/sell NFTs on OpenSea, Blur, Magic Eden. Track cost basis per NFT, calculate capital gains, and export to Form 8949 for tax filing.',
                challenge: 'Challenge: NFT cost basis tracking',
                solution: 'Solution: Per-NFT tracking with metadata'
              },
              {
                icon: '💎',
                title: 'Long-Term Holders',
                description: 'HODL strategy with occasional strategic sells. Optimize for long-term capital gains (0-20% tax vs 10-37% short-term). Track 1-year holding periods.',
                challenge: 'Challenge: Timing long-term gains',
                solution: 'Solution: Holding period tracker + alerts'
              }
            ].map((scenario, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-emerald-200 dark:border-teal-800 hover:border-emerald-400 dark:hover:border-teal-600 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{scenario.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {scenario.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {scenario.description}
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{scenario.challenge}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{scenario.solution}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Checklist */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Complete Trading Toolkit
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Professional features for serious traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { feature: 'Multi-Wallet Tracking', description: 'Connect unlimited wallets across 50+ chains' },
              { feature: 'FIFO/LIFO/HIFO Methods', description: 'Choose the best cost basis method for your strategy' },
              { feature: 'Wash Sale Alerts', description: '30-day rule tracking with proactive notifications' },
              { feature: 'Tax Loss Harvesting', description: 'AI-identified opportunities to offset gains' },
              { feature: 'DeFi Protocol Coverage', description: 'Uniswap, Aave, Jupiter, Raydium, and 50+ more' },
              { feature: 'Solana DeFi Support', description: 'Full Solana ecosystem tracking (Jupiter, Orca, Marinade)' },
              { feature: 'Real-Time Portfolio Value', description: 'Live prices and historical performance charts' },
              { feature: 'P&L Analysis', description: 'Realized/unrealized gains, ROI, performance metrics' },
              { feature: 'Form 8949 Export', description: 'IRS-compliant tax forms in CSV/PDF format' },
              { feature: 'AI Chat Assistant', description: 'Ask: "Show me my wash sales from last month"' },
              { feature: 'Multi-Country Tax Rates', description: 'See tax implications in 167 countries' },
              { feature: 'Transaction History', description: 'Complete audit trail with blockchain verification' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200 dark:border-teal-800"
              >
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.feature}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Trading Smarter Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join traders using AI to optimize portfolio tracking and minimize taxes
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/wallets"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Portfolio Demo
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 50+ chains supported
          </p>
        </div>
      </section>
    </PublicPageSSR>
  )
}
