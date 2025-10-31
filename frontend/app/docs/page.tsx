'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, BookOpen, Code, Rocket, FileText, Shield, Zap, Globe, Terminal, Book, MessageCircle, CheckCircle } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'
import { motion } from 'framer-motion'

export default function DocsPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Documentation - CryptoNomadHub",
            "description": "Complete guides and tutorials for CryptoNomadHub. Learn how to optimize crypto taxes across 167 countries, use DeFi audit, and track your crypto portfolio.",
            "url": "https://cryptonomadhub.com/docs"
          })
        }}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blue-50 via-indigo-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-300 text-sm font-bold mb-6">
              <BookOpen className="w-4 h-4" />
              DOCUMENTATION
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Everything You Need</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                To Get Started
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Complete guides and tutorials to master crypto tax optimization across 167 countries.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-600 dark:hover:border-indigo-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Help
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Documentation Categories
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find what you're looking for
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: 'Getting Started',
                description: 'Quick setup guide to connect wallets, run DeFi audit, and explore 167 country tax rates.',
                items: ['Create account', 'Connect wallets', 'Run first audit', 'View tax comparison'],
                gradient: 'from-emerald-500 to-teal-600',
                href: '#getting-started'
              },
              {
                icon: Globe,
                title: 'Country Tax Guide',
                description: 'Understand tax regulations, residency rules, and reporting requirements for all 167 countries.',
                items: ['Tax rate tables', 'Residency rules', '183-day tracking', 'Tax treaties'],
                gradient: 'from-blue-500 to-cyan-600',
                href: '#country-guide'
              },
              {
                icon: Terminal,
                title: 'DeFi Audit Guide',
                description: 'Learn how to audit 50+ chains, understand DeFi protocols, and export transaction reports.',
                items: ['Supported chains', 'Protocol coverage', 'Transaction types', 'Export formats'],
                gradient: 'from-violet-500 to-purple-600',
                href: '#defi-guide'
              },
              {
                icon: FileText,
                title: 'Tax Optimization',
                description: 'Master cost basis methods, wash sale detection, and tax loss harvesting strategies.',
                items: ['FIFO/LIFO/HIFO', 'Wash sale rules', 'Loss harvesting', 'Form 8949'],
                gradient: 'from-amber-500 to-orange-600',
                href: '#tax-optimization'
              },
              {
                icon: Shield,
                title: 'Security & Privacy',
                description: 'Learn about data encryption, privacy controls, and best practices for account security.',
                items: ['Data encryption', 'Password security', 'Privacy settings', 'Secure practices'],
                gradient: 'from-indigo-500 to-blue-600',
                href: '#security'
              }
            ].map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {category.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Popular Documentation
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Most frequently accessed guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'How to Connect Your Wallet',
                description: 'Step-by-step guide to connecting Ethereum, Solana, and other wallets to CryptoNomadHub.',
                time: '5 min read',
                badge: 'Getting Started',
                href: '/docs/connect-wallet'
              },
              {
                title: 'Understanding AI Country Scoring',
                description: 'Learn how we score 167 countries on crypto tax rates and nomad quality of life.',
                time: '8 min read',
                badge: 'Core Concepts',
                href: '/docs/ai-country-scoring'
              },
              {
                title: 'Running Your First DeFi Audit',
                description: 'Complete guide to auditing DeFi transactions across 50+ chains and protocols.',
                time: '10 min read',
                badge: 'Tutorial',
                href: '/docs/first-defi-audit'
              },
              {
                title: 'FIFO vs LIFO vs HIFO: Which to Choose?',
                description: 'Compare cost basis methods and understand which one optimizes your tax situation.',
                time: '12 min read',
                badge: 'Tax Strategy',
                href: '/docs/cost-basis-methods'
              },
              {
                title: 'Wash Sale Detection Explained',
                description: 'Understand the 30-day wash sale rule and how our AI detects violations automatically.',
                time: '7 min read',
                badge: 'Tax Strategy',
                href: '/docs/wash-sale-detection'
              }
            ].map((doc, idx) => (
              <Link
                key={idx}
                href={doc.href}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-indigo-600 shadow-md hover:shadow-xl transition-all cursor-pointer h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                      {doc.badge}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{doc.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {doc.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* API Preview */}

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Create your free account and start optimizing crypto taxes today
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 7-day free trial • Full documentation access
          </p>
        </div>
      </section>
    </PublicPageSSR>
  )
}
