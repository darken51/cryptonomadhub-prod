'use client'

import Link from 'next/link'
import { Globe, MessageCircle, Activity, DollarSign, Calculator, RefreshCw, ArrowRight, Shield, Lock, CheckCircle, Sparkles } from 'lucide-react'
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
                🌍 160+ Countries • #1 Global Coverage
              </span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="text-slate-900 dark:text-white">Global Crypto Tax</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient">
                  Optimization
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                The <strong className="text-slate-900 dark:text-white">ONLY</strong> platform covering{' '}
                <strong className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  160+ countries
                </strong>{' '}
                with AI-powered simulations, DeFi audit, and advanced tax optimization
              </p>
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
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Saving Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-600 dark:hover:border-fuchsia-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Calculate Savings
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
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
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
                <AnimatedCounter value={163} suffix="+" />
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Countries Supported
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                <AnimatedCounter value={2.8} suffix="M" prefix="$" decimals={1} />
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Tax Saved
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                <AnimatedCounter value={12} suffix="K+" />
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Active Users
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                99.9<span className="text-3xl">%</span>
              </div>
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                Uptime
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Optimize
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed for digital nomads and crypto investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                gradient: 'from-violet-500 to-fuchsia-600',
                title: '160+ Countries',
                description: 'Unmatched global coverage with official 2025 tax data. More countries than any competitor.',
                badge: null
              },
              {
                icon: MessageCircle,
                gradient: 'from-cyan-500 to-blue-600',
                title: 'AI Chat Assistant',
                description: 'Conversational AI powered by Llama 3.1 with full transparency mode and explain decision.',
                badge: null
              },
              {
                icon: Activity,
                gradient: 'from-emerald-400 to-teal-500',
                title: 'DeFi Audit',
                description: 'Real-time on-chain analysis across 40+ protocols. Automatically detect DeFi, NFTs, airdrops.',
                badge: 'NEW'
              },
              {
                icon: Calculator,
                gradient: 'from-sky-500 to-cyan-600',
                title: 'Cost Basis Tracking',
                description: 'FIFO, LIFO, HIFO methods with automatic wash sale detection. Perfect for complex portfolios.',
                badge: null
              },
              {
                icon: DollarSign,
                gradient: 'from-amber-400 to-orange-500',
                title: 'Tax Optimizer',
                description: 'AI-powered loss harvesting and opportunity detection. Maximize deductions legally.',
                badge: 'PRO'
              },
              {
                icon: RefreshCw,
                gradient: 'from-teal-400 to-emerald-500',
                title: 'Exchange Sync',
                description: 'Direct API integration with Binance, Coinbase, Kraken. Plus universal CSV import.',
                badge: null
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-fuchsia-700 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {feature.badge && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-violet-100 dark:bg-fuchsia-900/50 text-violet-700 dark:text-fuchsia-300 text-xs font-bold rounded">
                    {feature.badge}
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TAX SIMULATOR CTA */}
      <section id="calculator" className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Compare Tax Regulations Across 167 Countries
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Access real-time tax data from official sources. Compare capital gains rates, crypto-specific regulations, and residency requirements.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <Link
                href="/simulations/new"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Launch Tax Simulator
              </Link>
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-600 dark:hover:border-fuchsia-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Browse All Countries
              </Link>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              ⚠️ For informational purposes only. This is not financial, tax, or legal advice. Consult licensed professionals.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <ComparisonTable />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Four simple steps to optimize your crypto taxes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect', description: 'Link your wallets and exchanges in seconds', icon: '🔗' },
              { step: '02', title: 'Analyze', description: 'AI scans 160+ countries for best options', icon: '🔍' },
              { step: '03', title: 'Optimize', description: 'Get personalized tax-saving strategies', icon: '⚡' },
              { step: '04', title: 'Export', description: 'Generate compliant reports instantly', icon: '📄' }
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

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Join digital nomads saving millions in crypto taxes
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
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
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
            Ready to Optimize Your Crypto Taxes Globally?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of digital nomads saving on taxes across 160+ countries
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
