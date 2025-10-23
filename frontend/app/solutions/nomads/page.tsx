'use client'

import Link from 'next/link'
import { ArrowRight, Globe, Map, TrendingUp, Shield, CheckCircle, Heart, Plane, Home, DollarSign, Trophy } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'

export default function DigitalNomadsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "For Digital Nomads - Crypto Tax Optimization",
            "description": "Find the perfect country for your digital nomad lifestyle. AI-powered country scoring evaluates 167 countries on crypto tax rates AND quality of life.",
            "url": "https://cryptonomadhub.com/solutions/nomads"
          })
        }}
      />

      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-sm font-bold mb-6">
              <Plane className="w-4 h-4" />
              FOR DIGITAL NOMADS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Find Your Perfect</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Nomad Destination
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The only platform that scores countries on <strong>crypto tax rates</strong> AND <strong>quality of life for nomads</strong>. Find the perfect balance.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Explore 163 Countries
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-cyan-600 dark:hover:border-blue-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Nomads Love Us */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Digital Nomads
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We understand you need more than just tax rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: 'AI Nomad Score (0-100)',
                description: 'Unique scoring system that evaluates cost of living, visa accessibility, infrastructure, and expat community for every country.',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                icon: DollarSign,
                title: 'Tax + QoL Balance',
                description: 'Find countries with low crypto taxes AND great quality of life. Portugal (0% crypto tax) vs Singapore (0% tax + higher costs) - compare everything.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Map,
                title: 'Visa Requirements',
                description: 'See visa rules, residency requirements, and digital nomad visa programs for all 167 countries. 183-day rule tracking included.',
                gradient: 'from-violet-500 to-fuchsia-600'
              },
              {
                icon: Home,
                title: 'Cost of Living Data',
                description: 'Housing, food, healthcare costs factored into Nomad Score. See actual living costs vs potential tax savings.',
                gradient: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Heart,
                title: 'Expat Community',
                description: 'English proficiency, expat community size, networking opportunities - all evaluated by AI for each country.',
                gradient: 'from-pink-500 to-rose-600'
              },
              {
                icon: Shield,
                title: 'Multi-Country Compare',
                description: 'Compare 2-5 countries side-by-side. See tax savings, QoL scores, visa requirements all in one view. Make informed decisions.',
                gradient: 'from-indigo-500 to-purple-600'
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

      {/* Use Cases */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Common Nomad Scenarios
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              How we help digital nomads optimize their taxes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                scenario: '🇺🇸 → 🇵🇹',
                title: 'US Citizen Moving to Portugal',
                description: 'Portugal has 0% crypto tax (for now) but you still need to report to IRS. Our AI helps you understand US citizenship-based taxation + Portuguese residency requirements.',
                savings: 'Potential: 20-37% tax savings'
              },
              {
                scenario: '🌍 → 🇦🇪',
                title: 'Nomad Relocating to Dubai',
                description: 'UAE has 0% personal income tax and crypto-friendly regulations. We compare visa costs, cost of living, and help determine if the move makes financial sense.',
                savings: 'Potential: 30%+ tax savings'
              },
              {
                scenario: '🇩🇪 → 🇪🇸',
                title: 'EU Citizen Optimizing Within EU',
                description: 'Move from Germany (26% crypto tax) to Spain (19%) or Cyprus (0% long-term). Compare quality of life, visa requirements, and actual tax savings.',
                savings: 'Potential: 7-26% tax savings'
              },
              {
                scenario: '🛫 Multi-Country',
                title: 'Perpetual Traveler Strategy',
                description: 'Spend less than 183 days in multiple countries to avoid tax residency. Our dashboard tracks your days per country and alerts you before triggering tax residency.',
                savings: 'Avoid full residency tax'
              }
            ].map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-cyan-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-3xl mb-3">{useCase.scenario}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {useCase.description}
                </p>
                <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold">
                  {useCase.savings}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Nomads */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Tools built specifically for location-independent crypto holders
            </p>
          </div>

          <div className="space-y-4">
            {[
              { feature: 'Interactive World Map', description: 'Click any country to see full tax details + AI scores' },
              { feature: 'Multi-Country Comparison', description: 'Compare 2-5 countries side-by-side with identical calculations' },
              { feature: 'AI Chat Assistant', description: 'Ask: "Best countries for US citizen with $100k crypto gains?"' },
              { feature: 'Tax Simulations', description: 'Calculate exact savings: current country vs target destination' },
              { feature: 'Residency Rule Tracker', description: 'Track 183-day rule to avoid accidental tax residency' },
              { feature: 'Treaty Information', description: 'See tax treaty countries to avoid double taxation' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl border border-cyan-200 dark:border-blue-800"
              >
                <CheckCircle className="w-6 h-6 text-cyan-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
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
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Nomad Tax Optimization
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join digital nomads using AI to find the perfect country for taxes + lifestyle
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/countries"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Countries
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 7-day free trial • 167 countries analyzed
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
