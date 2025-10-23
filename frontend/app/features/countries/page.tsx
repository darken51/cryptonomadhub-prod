'use client'

import Link from 'next/link'
import { ArrowRight, Globe, Map, Database, Shield, CheckCircle, Sparkles, TrendingUp, FileText } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'

export default function CountriesFeaturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "167 Country Tax Database - CryptoNomadHub",
            "description": "Comprehensive crypto tax regulations for 167 countries with verified data from official sources including PwC, OECD, KPMG, and government APIs.",
            "url": "https://cryptonomadhub.com/features/countries"
          })
        }}
      />

      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300 text-sm font-bold mb-6">
              <Globe className="w-4 h-4" />
              MOST COMPREHENSIVE DATABASE
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">167 Countries</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
                Complete Tax Coverage
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The most comprehensive crypto tax database in the industry. Verified data from official government sources, updated quarterly.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Explore Interactive Map
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-600 dark:hover:border-fuchsia-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '167', label: 'Countries', sublabel: 'Most in industry' },
              { value: '5+', label: 'Data Sources', sublabel: 'PwC, OECD, KPMG' },
              { value: '100%', label: 'Verified', sublabel: 'Official sources' },
              { value: 'Q4', label: 'Updates', sublabel: 'Quarterly refresh' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              What You Get for Each Country
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive data points for informed decision-making
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Tax Rates',
                description: 'Short-term and long-term capital gains tax rates. Crypto-specific rates when available (25+ countries).'
              },
              {
                icon: Shield,
                title: 'Legal Status',
                description: 'Crypto legal status (legal, restricted, banned). Regulatory framework and enforcement level.'
              },
              {
                icon: FileText,
                title: 'Reporting Rules',
                description: 'DeFi reporting requirements, staking/mining tax treatment, NFT rules, holding period definitions.'
              },
              {
                icon: Database,
                title: 'Data Sources',
                description: 'Direct links to government sources. Data from PwC, OECD, KPMG, Tax Foundation, and official tax authorities.'
              },
              {
                icon: Map,
                title: 'Residency Rules',
                description: '183-day rule, citizenship-based taxation, territorial systems, tax treaty information.'
              },
              {
                icon: Sparkles,
                title: 'AI Analysis',
                description: 'Crypto score (0-100) and Nomad score (0-100) with AI-generated insights and recommendations.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Quality */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Verified from Official Sources
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every data point cross-referenced with government sources and professional tax firms
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {['PwC', 'OECD', 'KPMG', 'Tax Foundation', 'Government APIs'].map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md text-center"
              >
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
                  {source}
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore 167 Countries Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Interactive map, detailed regulations, and AI-powered country scoring
          </p>
          <Link
            href="/countries"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Globe className="w-5 h-5 mr-2" />
            View Interactive Map
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
