'use client'

import Link from 'next/link'
import { Shield, Database, Sparkles, Globe, Users, CheckCircle, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutClient() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">About</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
                CryptoNomadHub
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The most comprehensive AI-powered crypto tax platform for digital nomads. Helping you legally optimize your crypto taxes across 167 countries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            CryptoNomadHub was created to solve a critical problem: digital nomads and crypto investors lack access to comprehensive, reliable tax information across multiple jurisdictions.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            We believe that tax optimization through legal residency changes is a fundamental right. Our platform provides the data, tools, and AI-powered insights you need to make informed decisions about where to establish tax residency.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            We are committed to transparency, accuracy, and helping digital nomads navigate the complex world of international crypto taxation.
          </p>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Why Trust Our Data
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: 'Official Sources Only',
                description: 'All data sourced from government publications, OECD, PwC, KPMG, Tax Foundation, and official tax authorities. We never rely on unverified third-party data.'
              },
              {
                icon: Shield,
                title: 'Quarterly Updates',
                description: 'Tax laws change frequently. Our team updates country data quarterly, with AI scrapers monitoring official sources for real-time changes.'
              },
              {
                icon: Sparkles,
                title: 'AI Verification',
                description: 'Dual AI system cross-references data points across multiple sources. Confidence scores indicate data reliability for each country.'
              },
              {
                icon: CheckCircle,
                title: 'Audit Trail',
                description: 'Every data point includes source links and last-updated timestamps. Full transparency on where information comes from.'
              },
              {
                icon: Globe,
                title: '167 Countries Covered',
                description: 'Most comprehensive database in the industry. From major economies to emerging crypto havens, we cover them all.'
              },
              {
                icon: Users,
                title: 'Community Verified',
                description: '1,200+ digital nomads use our platform daily. User feedback helps us identify outdated information quickly.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
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

      {/* Data Sources */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Our Data Sources
          </h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Professional Tax Firms
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  PwC Tax Summaries (167 countries)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  KPMG Global Tax Guides
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Deloitte International Tax Source (DITS)
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                International Organizations
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  OECD Tax Database
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Tax Foundation Global Tax Data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  World Bank Tax Statistics
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Government Sources
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Official tax authority websites (167 countries)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Government tax law publications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  Official cryptocurrency regulations and guidance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Important Disclaimer
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              CryptoNomadHub provides educational tools and informational resources only. We are not a tax advisory firm, law firm, or accounting firm.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Tax laws are complex and change frequently. While we strive for accuracy, our data should not be considered legal or tax advice.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Always consult with a licensed tax professional in your jurisdiction before making any residency or tax decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Questions or Feedback?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            We're always improving our platform. Reach out with suggestions, corrections, or questions.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
