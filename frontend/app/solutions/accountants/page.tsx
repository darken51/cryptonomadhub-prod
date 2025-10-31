'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Briefcase, Users, FileText, CheckCircle, Shield, Clock, TrendingUp, Globe, Calculator, BarChart3, Zap } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import { motion } from 'framer-motion'

export default function AccountantsPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "For Accountants & CPAs - Crypto Tax Professional Tools",
            "description": "Professional crypto tax tools for accountants and CPAs. Client management, Form 8949 export, 167 country tax knowledge, FIFO/LIFO/HIFO, and wash sale detection. Save 80% of research time.",
            "url": "https://cryptonomadhub.com/solutions/accountants"
          })
        }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-indigo-50 via-violet-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-violet-900/30 text-indigo-700 dark:text-violet-300 text-sm font-bold mb-6">
              <Briefcase className="w-4 h-4" />
              FOR ACCOUNTANTS & CPAs
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Serve Crypto Clients</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                With Confidence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Professional crypto tax tools for accountants. <strong>167 country tax knowledge</strong>, <strong>Form 8949 export</strong>, and <strong>client management</strong>. Save 80% of research time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-violet-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                View Tax Database
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why CPAs Choose Us */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Tax Professionals
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to serve crypto clients efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: '167 Country Tax Database',
                description: 'Instant access to crypto tax rates, regulations, and reporting requirements for every country. Sourced from PwC, OECD, KPMG, and government APIs.',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: FileText,
                title: 'Form 8949 Export',
                description: 'One-click IRS Form 8949 generation with complete transaction details. CSV/PDF export ready for tax software or manual filing.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Calculator,
                title: 'FIFO/LIFO/HIFO',
                description: 'Support all IRS-approved cost basis methods. Compare scenarios to optimize client tax outcomes. Automatic wash sale detection.',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                icon: Users,
                title: 'Client Management',
                description: 'Manage multiple crypto clients in one dashboard. Track deadlines, client data, and progress on tax preparation.',
                gradient: 'from-violet-500 to-purple-600'
              },
              {
                icon: Shield,
                title: 'Audit Trail',
                description: 'Complete blockchain verification for every transaction. Defensible documentation for IRS audits with timestamp and hash proof.',
                gradient: 'from-rose-500 to-pink-600'
              },
              {
                icon: Clock,
                title: 'Save 80% Time',
                description: 'Eliminate manual blockchain research. AI extracts DeFi transactions, calculates basis, and detects wash sales automatically.',
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

      {/* Client Scenarios */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Common Client Scenarios
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Handle complex crypto situations with ease
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '💼',
                title: 'CPA with Crypto Clients',
                description: 'Your traditional clients are asking about crypto taxes. You need to understand DeFi, NFTs, staking, and cost basis methods without spending 40 hours researching.',
                problem: 'Problem: No crypto expertise',
                solution: 'Solution: AI analyzes wallets, calculates everything automatically'
              },
              {
                icon: '🏢',
                title: 'Accounting Firm Expansion',
                description: 'Your firm wants to offer crypto tax services but lacks the tools. You need multi-client management, standardized reports, and quality assurance.',
                problem: 'Problem: No crypto infrastructure',
                solution: 'Solution: Professional platform for multiple accountants + clients'
              },
              {
                icon: '📊',
                title: 'Tax Season Crunch',
                description: 'Client shows up April 10th with 5,000 DeFi transactions across Ethereum, Solana, Polygon. You need accurate Form 8949 by April 15th.',
                problem: 'Problem: Manual work takes 80+ hours',
                solution: 'Solution: AI audit completes in 5 minutes, export Form 8949'
              },
              {
                icon: '🌍',
                title: 'International Clients',
                description: 'US client moved to Portugal (0% crypto tax). German client trading from Spain. You need to understand tax residency, treaties, and 183-day rules for 167 countries.',
                problem: 'Problem: No global tax expertise',
                solution: 'Solution: 167 country database with AI recommendations'
              }
            ].map((scenario, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-indigo-200 dark:border-violet-800 hover:border-indigo-400 dark:hover:border-violet-600 shadow-lg hover:shadow-xl transition-all"
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
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{scenario.problem}</span>
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

      {/* Professional Features */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Professional-Grade Tools
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything CPAs need for crypto tax preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { feature: '167 Country Tax Database', description: 'Instant crypto tax rates and regulations worldwide' },
              { feature: 'Form 8949 Export', description: 'IRS-compliant forms in CSV/PDF format' },
              { feature: 'FIFO/LIFO/HIFO Methods', description: 'All IRS-approved cost basis methods supported' },
              { feature: 'Wash Sale Detection', description: '30-day rule tracking for crypto transactions' },
              { feature: 'Client Management', description: 'Organize multiple clients in one dashboard' },
              { feature: '50+ Chain Support', description: 'Ethereum, Solana, Polygon, Arbitrum, Base, and more' },
              { feature: 'DeFi Protocol Coverage', description: 'Uniswap, Aave, Jupiter, Raydium auto-detected' },
              { feature: 'NFT Transaction Support', description: 'OpenSea, Blur, Magic Eden tracking' },
              { feature: 'Staking & Rewards', description: 'Income recognition for staking rewards' },
              { feature: 'Blockchain Verification', description: 'Complete audit trail with transaction hashes' },
              { feature: 'AI Chat Assistant', description: 'Ask: "Show client wash sales for 2024"' },
              { feature: 'Multi-Country Comparison', description: 'Compare tax implications across countries' },
              { feature: 'Tax Loss Harvesting', description: 'Identify opportunities for client deductions' },
              { feature: 'Historical Data', description: 'Access past transactions and tax years' },
              { feature: 'CSV/PDF Reports', description: 'Professional client-facing reports' },
              { feature: 'Data Security', description: 'Bank-level encryption and privacy protection' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-xl border border-indigo-200 dark:border-violet-800"
              >
                <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.feature}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Massive Time Savings
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Stop spending hours on blockchain research
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { task: 'DeFi Transaction Analysis', manual: '40+ hours', automated: '5 minutes', savings: '99% faster' },
              { task: 'Cost Basis Calculation', manual: '20 hours', automated: 'Instant', savings: '100% automated' },
              { task: 'International Tax Research', manual: '8 hours', automated: '2 minutes', savings: '240x faster' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-indigo-200 dark:border-violet-800 shadow-lg text-center"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{item.task}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Manual</div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{item.manual}</div>
                  </div>
                  <div className="text-xl">→</div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">With AI</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{item.automated}</div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-violet-900/30 text-indigo-700 dark:text-violet-300 rounded-full text-sm font-semibold mt-2">
                    {item.savings}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Serving Crypto Clients Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join CPAs and accounting firms using AI to handle crypto taxes efficiently
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/countries"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <Globe className="w-5 h-5 mr-2" />
              View Tax Database
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 7-day free trial • 167 countries covered
          </p>
        </div>
      </section>
    </PublicPageSSR>
  )
}
