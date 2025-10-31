'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Trophy, TrendingUp, Shield, Sparkles, CheckCircle, Globe, Heart, Wallet, Scale, Map, DollarSign } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import { motion } from 'framer-motion'

export default function AIScoringPage() {
  return (
    <PublicPageSSR>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300 text-sm font-bold mb-6">
              <Trophy className="w-4 h-4" />
              UNIQUE FEATURE
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">AI Country Scoring</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
                Crypto + Nomad = Perfect Match
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The only platform with dual AI scoring that evaluates countries based on <strong>crypto tax friendliness</strong> AND <strong>quality of life for nomads</strong>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Explore 167 Country Scores
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/simulations/new"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-600 dark:hover:border-fuchsia-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Try Simulator
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Dual Scoring System
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Two independent AI scores combined into one overall rating
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Crypto Score */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl p-8 border-2 border-violet-200 dark:border-fuchsia-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Crypto Score</h3>
                    <p className="text-sm text-violet-600 dark:text-fuchsia-400">0-100 points</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  AI evaluation of crypto tax environment and regulatory landscape
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Evaluation Criteria:</h4>
                  {[
                    { icon: DollarSign, label: 'Tax Rates', detail: 'Short-term & long-term CGT' },
                    { icon: Shield, label: 'Legal Status', detail: 'Banned, restricted, or legal' },
                    { icon: Scale, label: 'Enforcement Level', detail: 'Reporting requirements' },
                    { icon: TrendingUp, label: 'Crypto Adoption', detail: 'Infrastructure & ecosystem' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <div className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-2">Example:</div>
                  <div className="text-sm text-violet-800 dark:text-violet-300">
                    🇸🇬 Singapore: <strong>95/100</strong> (0% tax, clear regulations)
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Nomad Score */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-teal-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nomad Score</h3>
                    <p className="text-sm text-emerald-600 dark:text-teal-400">0-100 points</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  AI evaluation of quality of life, infrastructure, and expat experience
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Evaluation Criteria:</h4>
                  {[
                    { icon: DollarSign, label: 'Cost of Living', detail: 'Housing, food, healthcare' },
                    { icon: Map, label: 'Visa Accessibility', detail: 'Ease of entry & residency' },
                    { icon: Sparkles, label: 'Infrastructure', detail: 'Internet, transport, amenities' },
                    { icon: Heart, label: 'Expat Community', detail: 'English, networking, culture' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                      <item.icon className="w-5 h-5 text-emerald-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Example:</div>
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">
                    🇵🇹 Portugal: <strong>88/100</strong> (great QoL, affordable, visa-friendly)
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Overall Score Formula */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl p-8 border-2 border-violet-200 dark:border-fuchsia-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Overall Score Formula</h3>
              <div className="text-lg text-slate-700 dark:text-slate-300">
                <span className="font-mono bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">
                  Overall = (Crypto Score × 60%) + (Nomad Score × 40%)
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                Weighted to prioritize tax benefits while considering lifestyle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Why AI Scoring Matters
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Make data-driven decisions instead of guessing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Objective Analysis',
                description: 'AI eliminates bias and evaluates 100+ data points per country from official sources (PwC, OECD, KPMG, government APIs).'
              },
              {
                icon: TrendingUp,
                title: 'Auto-Updated',
                description: 'Scores refresh every 30 days automatically. Tax data updated quarterly. Always current, never stale.'
              },
              {
                icon: CheckCircle,
                title: 'Confidence Scores',
                description: 'Every score includes AI confidence rating (0-1) and data quality indicator (high/medium/low) for transparency.'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-violet-600 dark:text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Country?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Explore AI scores for 167 countries and discover the best match for your crypto lifestyle
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/countries"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View All Country Scores
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      </PublicPageSSR>
  )
}
