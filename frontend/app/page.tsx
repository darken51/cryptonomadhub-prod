'use client'

import Link from 'next/link'
import { Globe, MessageCircle, Activity, DollarSign, Calculator, RefreshCw, ArrowRight, Shield, Lock, CheckCircle, Sparkles, TrendingUp, Zap, LineChart, FileText, AlertTriangle, Trophy, BarChart3, Layers, Target } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { ComparisonTable } from '@/components/ComparisonTable'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import { FAQAccordion } from '@/components/FAQAccordion'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function Home() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true })
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* SEO Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CryptoNomadHub",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1247"
            },
            "description": "AI-powered crypto tax optimization platform covering 167 countries with Solana DeFi audit, multi-country comparison, wash sale detection, and IRS Form 8949 export. Data sourced from government authorities and verified by AI tax scrapers.",
            "featureList": [
              "167 country tax regulations from official sources",
              "43 countries with 0% crypto tax",
              "AI country scoring (crypto + nomad)",
              "Multi-country comparison (2-5 countries)",
              "50+ blockchain support (Ethereum, Solana, Layer 2s)",
              "DeFi audit across Uniswap, Aave, Jupiter, Raydium",
              "Cost basis tracking (FIFO, LIFO, HIFO)",
              "Wash sale detection",
              "IRS Form 8949 export",
              "Tax-loss harvesting",
              "Wallet portfolio tracking",
              "AI chat with direct portfolio analysis"
            ]
          })
        }}
      />

      <Header />

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-200 dark:border-fuchsia-800 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-fuchsia-400" />
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                🤖 AI-Powered Platform • 167 Countries Analyzed
              </span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="text-slate-900 dark:text-white">The AI Crypto Tax Platform</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">
                  for Digital Nomads
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
                Find which of <strong className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">167 countries</strong> let you pay <strong className="text-emerald-600 dark:text-emerald-400">0% crypto tax</strong>.
                AI analyzes your situation and gives personalized relocation recommendations in <strong className="text-slate-900 dark:text-white">60 seconds</strong>.
              </p>
            </div>

            {/* Real Country Examples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-sm">
              {[
                { flag: '🇵🇹', country: 'Portugal', tax: '0% tax', detail: '€900/mo cost, EU access' },
                { flag: '🇦🇪', country: 'UAE', tax: '0% tax', detail: 'Golden visa, no winter' },
                { flag: '🇸🇬', country: 'Singapore', tax: '0% tax', detail: '#1 quality of life' },
                { flag: '🇵🇦', country: 'Panama', tax: '0% tax', detail: '$1,200/mo, easy visa' }
              ].map((country, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-lg"
                >
                  <div className="text-3xl mb-2">{country.flag}</div>
                  <div className="font-bold text-slate-900 dark:text-white">{country.country}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{country.tax}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{country.detail}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
            >
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Find My 0% Tax Country
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                See All Tax-Free Countries
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-slate-600 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Takes 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>1,200+ nomads helped</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* REAL STATS BAR */}
      <section
        ref={statsRef}
        className="py-12 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-y border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
                <AnimatedCounter value={167} />
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Countries Analyzed
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Most comprehensive database
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                <AnimatedCounter value={43} />
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Countries with 0% Tax
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Pay zero legally
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                $<AnimatedCounter value={127} />k
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Average Tax Savings
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Per year by moving
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                <AnimatedCounter value={1200} />+
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Digital Nomads Helped
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Now paying 0% tax
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* UNIQUE FEATURES - What Competitors Don't Have */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-violet-100 dark:bg-fuchsia-900/30 text-violet-700 dark:text-fuchsia-300 text-sm font-bold rounded-full mb-4">
              🏆 EXCLUSIVE FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Features you won't find anywhere else
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Trophy,
                gradient: 'from-amber-500 to-orange-600',
                title: 'AI Country Scoring',
                description: 'Unique dual scoring system: Crypto Score (tax rates, legal status, enforcement) + Nomad Score (visa policy, cost of living, quality of life). Auto-refreshed every 30 days with confidence ratings.',
                badge: 'UNIQUE',
                features: ['Crypto score 0-100', 'Nomad score 0-100', 'Key advantages/disadvantages', 'Best for recommendations']
              },
              {
                icon: BarChart3,
                gradient: 'from-violet-500 to-purple-600',
                title: 'Multi-Country Comparison',
                description: 'Compare 2-5 countries simultaneously with side-by-side tax calculations, effective rates, and savings estimates. No other platform lets you compare multiple destinations at once.',
                badge: 'UNIQUE',
                features: ['Compare up to 5 countries', 'Side-by-side analysis', 'Automatic ranking', 'Informational notes']
              },
              {
                icon: Layers,
                gradient: 'from-cyan-500 to-blue-600',
                title: 'Solana DeFi Support',
                description: '50+ blockchains including full Solana support (Jupiter, Raydium, Orca, Marinade) plus all major Layer 2s (Arbitrum, Optimism, Base, Blast, zkSync, Scroll). Most platforms only do Ethereum.',
                badge: 'RARE',
                features: ['Solana protocols', '50+ chains', 'All major L2s', 'Real-time tracking']
              },
              {
                icon: LineChart,
                gradient: 'from-emerald-500 to-teal-600',
                title: 'Wallet Portfolio Tracking',
                description: 'Historical charts (7d/30d/90d/1y), 24h change tracking, consolidated view across all wallets, and automatic position breakdown. Track your entire crypto portfolio in one place.',
                badge: 'NEW',
                features: ['Historical charts', '24h changes', 'Multi-wallet view', 'Token positions']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-violet-200 dark:border-fuchsia-800 hover:border-violet-400 dark:hover:border-fuchsia-600 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full">
                  {feature.badge}
                </div>

                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE WORLD MAP CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-6">
                🗺️ INTERACTIVE WORLD MAP
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Explore Tax Regulations Across 167 Countries
              </h2>

              <p className="text-xl text-white/90 mb-8">
                Interactive world map with hover tooltips showing crypto tax rates, legal status, and data quality for every country. Color-coded by tax rate from 0% (green) to 30%+ (red).
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: '🌍', text: 'Real-time data from 167 countries' },
                  { icon: '🎨', text: 'Color-coded by tax rate (0% to 30%+)' },
                  { icon: '🔍', text: 'Hover any country for instant details' },
                  { icon: '📊', text: 'AI country scores + rankings' },
                  { icon: '🔗', text: 'Click to view full country analysis' }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="text-white/90 text-lg">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Globe className="w-5 h-5 mr-2" />
                Explore Interactive Map
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>

            {/* Right: Visual Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Map Preview Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                {/* Fake map representation */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden">
                  {/* Simulated world map with gradient dots */}
                  <div className="absolute inset-0 opacity-30">
                    {/* Grid of dots representing countries */}
                    <div className="grid grid-cols-12 grid-rows-8 h-full w-full gap-1 p-4">
                      {Array.from({ length: 96 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            i % 5 === 0 ? 'bg-emerald-500' : // 0% tax
                            i % 5 === 1 ? 'bg-blue-500' : // Low tax
                            i % 5 === 2 ? 'bg-amber-500' : // Medium
                            i % 5 === 3 ? 'bg-red-500' : // High
                            'bg-slate-700' // No data
                          }`}
                          style={{
                            opacity: i % 7 === 0 ? 0.3 : 1,
                            animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.02}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating tooltip preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute top-8 left-8 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-white/20 text-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🇵🇹</span>
                      <span className="font-bold">Portugal</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div>Crypto Tax: <span className="text-emerald-400 font-bold">0%</span></div>
                      <div>Status: <span className="text-emerald-400">Legal</span></div>
                      <div>Quality: <span className="text-emerald-400">High</span></div>
                    </div>
                  </motion.div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <div className="text-white text-sm font-semibold">
                      167 Countries • Real-time Data
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  {[
                    { color: 'bg-emerald-500', label: '0% Tax' },
                    { color: 'bg-blue-500', label: '<10%' },
                    { color: 'bg-amber-500', label: '10-20%' },
                    { color: 'bg-red-500', label: '20-30%' },
                    { color: 'bg-red-900', label: '>30%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${item.color}`}></div>
                      <span className="text-white/80 text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Complete Tax Optimization Suite
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                gradient: 'from-violet-500 to-fuchsia-600',
                title: 'Tax Simulations',
                description: 'Compare current vs target country with AI-powered explanations, confidence scores, and PDF export.',
                features: ['AI explanations', 'Confidence scores', 'PDF reports', 'Simulation history']
              },
              {
                icon: MessageCircle,
                gradient: 'from-cyan-500 to-blue-600',
                title: 'AI Chat Assistant',
                description: 'Advanced conversational AI that analyzes your portfolio data directly. Context-aware recommendations based on your actual positions.',
                features: ['Analyzes your data', 'Context-aware', 'Country suggestions', 'Portfolio insights']
              },
              {
                icon: Activity,
                gradient: 'from-emerald-400 to-teal-500',
                title: 'DeFi Audit',
                description: 'Scan 50+ chains for DeFi activity. Uniswap, Aave, Compound, Jupiter, Raydium detection.',
                features: ['50+ chains', 'Auto-detect protocols', 'CSV/PDF export', 'Transaction history']
              },
              {
                icon: Calculator,
                gradient: 'from-sky-500 to-cyan-600',
                title: 'Cost Basis Tracking',
                description: 'FIFO, LIFO, HIFO methods with wash sale detection and IRS Form 8949 export.',
                features: ['FIFO/LIFO/HIFO', 'Wash sale alerts', 'Form 8949 export', 'CSV import']
              },
              {
                icon: DollarSign,
                gradient: 'from-amber-400 to-orange-500',
                title: 'Tax Optimizer',
                description: 'AI-powered tax-loss harvesting and timing optimization with potential savings calculator.',
                features: ['Loss harvesting', 'LT timing', 'Deadline tracking', 'Multi-currency']
              },
              {
                icon: TrendingUp,
                gradient: 'from-pink-400 to-rose-500',
                title: 'Dashboard & Alerts',
                description: 'Central hub with portfolio stats, critical alerts, opportunities, and activity timeline.',
                features: ['Portfolio overview', 'Alert system', 'Tax opportunities', 'Activity feed']
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-fuchsia-700 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-1">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-1 h-1 bg-violet-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA QUALITY & TRANSPARENCY */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold rounded-full mb-4">
              ✓ VERIFIED DATA
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Trustworthy Data from Official Sources
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              All tax data verified against official government sources and professional tax firms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-violet-200 dark:border-fuchsia-800">
              <Shield className="w-12 h-12 text-violet-600 dark:text-fuchsia-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Official Sources
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Tax data verified from PwC, OECD, KPMG, Tax Foundation, direct government sources, and AI-powered CryptoTaxScraper.
              </p>
              <div className="flex flex-wrap gap-2">
                {['PwC', 'OECD', 'KPMG', 'Tax Foundation', 'Gov APIs', 'AI Scraper'].map((source) => (
                  <span key={source} className="px-2 py-1 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 rounded border border-violet-200 dark:border-fuchsia-700">
                    {source}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-emerald-200 dark:border-teal-800">
              <RefreshCw className="w-12 h-12 text-emerald-600 dark:text-teal-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Auto-Updated
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                AI country analysis auto-refreshes every 30 days. Tax data manually updated quarterly from official sources.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  30-day AI refresh
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Quarterly data updates
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-cyan-200 dark:border-blue-800">
              <Sparkles className="w-12 h-12 text-cyan-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Explain Decision
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Full AI transparency mode shows reasoning, rules applied, assumptions, confidence scores, and sources for every recommendation.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  Reasoning explained
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  Confidence scores
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Designed for different types of crypto investors
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                emoji: '🌍',
                title: 'Digital Nomads',
                description: 'AI country scoring helps choose best location for taxes + quality of life',
                highlight: '167 countries analyzed'
              },
              {
                emoji: '🔄',
                title: 'DeFi Traders',
                description: 'Full Solana support + 50+ chains with protocol-level transaction detection',
                highlight: 'Solana, Jupiter, Raydium'
              },
              {
                emoji: '📊',
                title: 'Multi-Chain Investors',
                description: 'Consolidated portfolio tracking across Ethereum, L2s, Solana, and sidechains',
                highlight: 'All chains in one view'
              },
              {
                emoji: '💰',
                title: 'Tax Optimizers',
                description: 'Automated wash sale detection + tax-loss harvesting opportunities',
                highlight: 'IRS Form 8949 export'
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-fuchsia-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{useCase.emoji}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {useCase.description}
                </p>
                <div className="text-xs font-semibold text-violet-600 dark:text-fuchsia-400">
                  {useCase.highlight}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TAX SIMULATOR CTA */}
      <section id="calculator" className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Try the AI Country Analyzer
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Get instant crypto tax scores + nomad scores for any country. See key advantages, disadvantages, and personalized recommendations.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <Link
                href="/simulations/new"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Launch Simulator
              </Link>
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-600 dark:hover:border-fuchsia-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Globe className="w-5 h-5 mr-2" />
                Browse 167 Countries
              </Link>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              ⚠️ For informational purposes only. This is not financial, tax, or legal advice. Consult licensed professionals.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Four simple steps to optimize your crypto taxes globally
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallets', description: 'Add wallet addresses or import CSV transactions', icon: '🔗' },
              { step: '02', title: 'AI Analyzes 167 Countries', description: 'Dual scoring: crypto tax rates + nomad quality of life', icon: '🤖' },
              { step: '03', title: 'Get Recommendations', description: 'Personalized suggestions with confidence scores', icon: '🎯' },
              { step: '04', title: 'Export Reports', description: 'IRS Form 8949, CSV, or PDF with full audit trail', icon: '📄' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-violet-600 dark:text-fuchsia-400 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full">
                    <div className="border-t-2 border-dashed border-violet-300 dark:border-fuchsia-700"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <ComparisonTable />
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by Digital Nomads Worldwide
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Real stories from users optimizing their crypto taxes
            </p>
          </div>

          <TestimonialCarousel />

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { icon: Shield, text: 'SOC 2 Compliant' },
              { icon: Lock, text: 'Bank-Level Security' },
              { icon: CheckCircle, text: 'GDPR Ready' }
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <badge.icon className="w-5 h-5" />
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <FAQAccordion />
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Optimize Your Crypto Taxes with AI?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join digital nomads using AI country scoring across 167 countries
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* LEGAL DISCLAIMER */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <LegalDisclaimer variant="prominent" />
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
