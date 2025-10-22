'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, HelpCircle, MessageCircle, Mail, BookOpen, ChevronDown, Search, Zap, Globe, Activity, Calculator, Users, Shield } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQ {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  icon: any
  gradient: string
  faqs: FAQ[]
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const faqCategories: FAQCategory[] = [
    {
      title: 'Getting Started',
      icon: Zap,
      gradient: 'from-emerald-500 to-teal-600',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click "Sign Up Free" in the header, enter your email and password, and verify your email address. No credit card required for the 7-day free trial.'
        },
        {
          question: 'How do I connect my wallet?',
          answer: 'Go to Dashboard > Wallets > Add Wallet. Enter your public wallet address for Ethereum, Solana, or other supported chains. We never ask for private keys or seed phrases.'
        },
        {
          question: 'Which blockchains are supported?',
          answer: 'We support 50+ chains including Ethereum, Solana, Polygon, Arbitrum, Optimism, Base, Avalanche, BNB Chain, and more. Full list available in documentation.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes. We use bank-level encryption (AES-256), never store private keys, and only read public blockchain data. Your portfolio data is encrypted at rest and in transit.'
        }
      ]
    },
    {
      title: 'Country Tax Database',
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-600',
      faqs: [
        {
          question: 'How many countries are covered?',
          answer: 'We cover all 163 countries with verified crypto tax rates sourced from PwC, OECD, KPMG, Tax Foundation, government APIs, and our AI tax scraper.'
        },
        {
          question: 'How often is tax data updated?',
          answer: 'Tax data is updated quarterly and whenever major regulatory changes occur. We monitor 163 countries continuously for policy updates.'
        },
        {
          question: 'What is AI Country Scoring?',
          answer: 'Our AI scores each country 0-100 on two dimensions: Crypto Score (tax rates, regulations) and Nomad Score (cost of living, visa access, QoL). Overall score is 60% crypto + 40% nomad.'
        },
        {
          question: 'Can I compare multiple countries?',
          answer: 'Yes! Use the Multi-Country Compare feature to compare 2-5 countries side-by-side. See tax rates, AI scores, visa requirements, and cost of living all in one view.'
        }
      ]
    },
    {
      title: 'DeFi Audit',
      icon: Activity,
      gradient: 'from-violet-500 to-purple-600',
      faqs: [
        {
          question: 'What is a DeFi audit?',
          answer: 'A DeFi audit scans your wallet address across 50+ blockchains and automatically detects all DeFi transactions (swaps, LP, staking, lending). No manual CSV uploads needed.'
        },
        {
          question: 'Does it support Solana DeFi?',
          answer: 'Yes! We support Solana DeFi protocols including Jupiter, Raydium, Orca, Marinade, and more. This is unique among crypto tax platforms.'
        },
        {
          question: 'How long does an audit take?',
          answer: 'Most audits complete in 2-5 minutes depending on transaction volume. You\'ll see results in real-time as transactions are processed.'
        },
        {
          question: 'Can I export audit results?',
          answer: 'Yes. Export to CSV or PDF with complete transaction details, cost basis calculations, and tax implications. Compatible with TurboTax and accountant software.'
        }
      ]
    },
    {
      title: 'Tax Optimization',
      icon: Calculator,
      gradient: 'from-amber-500 to-orange-600',
      faqs: [
        {
          question: 'What is tax loss harvesting?',
          answer: 'Selling crypto assets at a loss to offset capital gains and reduce your tax bill. Our AI identifies opportunities automatically and shows potential savings.'
        },
        {
          question: 'What are FIFO, LIFO, and HIFO?',
          answer: 'Cost basis methods: FIFO (First In First Out), LIFO (Last In First Out), HIFO (Highest In First Out). Choose the method that minimizes your taxes. We calculate all three.'
        },
        {
          question: 'What is the wash sale rule?',
          answer: 'IRS rule: if you sell crypto at a loss and buy it back within 30 days, the loss may be disallowed. Our system tracks this automatically and alerts you.'
        },
        {
          question: 'Can I export Form 8949?',
          answer: 'Yes. One-click Form 8949 generation with complete transaction details. Export as CSV or PDF for direct IRS filing or import to tax software.'
        }
      ]
    },
    {
      title: 'For Accountants',
      icon: Users,
      gradient: 'from-indigo-500 to-blue-600',
      faqs: [
        {
          question: 'Can I manage multiple clients?',
          answer: 'Yes. Professional plans include client management features. Add clients, track their portfolios, and generate reports all from one dashboard.'
        },
        {
          question: 'Is there an API for integration?',
          answer: 'Yes. REST API with authentication, rate limits (1000 req/hour), and webhook support. Full documentation available at /docs.'
        },
        {
          question: 'What reports can I generate?',
          answer: 'Form 8949, capital gains/losses, transaction history, cost basis reports, wash sale reports, and custom CSV/PDF exports for clients.'
        },
        {
          question: 'Do you offer white-label solutions?',
          answer: 'Contact our sales team for enterprise and white-label solutions. We can customize branding and integrate with your existing systems.'
        }
      ]
    },
    {
      title: 'Billing & Plans',
      icon: Shield,
      gradient: 'from-rose-500 to-pink-600',
      faqs: [
        {
          question: 'How much does it cost?',
          answer: 'We offer a 7-day free trial (no credit card required). Paid plans start at $29/month for individuals. Professional and enterprise plans available for accountants.'
        },
        {
          question: 'Can I cancel anytime?',
          answer: 'Yes. Cancel anytime from your account settings. No cancellation fees. You\'ll retain access until the end of your billing period.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'Credit card, debit card, and crypto payments (USDC, USDT). All payments are processed securely through Stripe.'
        },
        {
          question: 'Is there a refund policy?',
          answer: 'Yes. 30-day money-back guarantee if you\'re not satisfied. Contact support@cryptonomadhub.com for refunds.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Help Center - CryptoNomadHub",
            "description": "Frequently asked questions about CryptoNomadHub. Get help with crypto tax optimization, DeFi audit, country comparisons, and more.",
            "url": "https://cryptonomadhub.com/help"
          })
        }}
      />

      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-sm font-bold mb-6">
              <HelpCircle className="w-4 h-4" />
              HELP CENTER
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">How Can We</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Help You Today?
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Find answers to frequently asked questions or contact our support team
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'Live Chat Support',
                description: 'Chat with our team in real-time',
                action: 'Start Chat',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Mail,
                title: 'Email Support',
                description: 'Get help via email within 24h',
                action: 'Send Email',
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                icon: BookOpen,
                title: 'Documentation',
                description: 'Browse complete guides and tutorials',
                action: 'View Docs',
                gradient: 'from-violet-500 to-purple-600'
              }
            ].map((link, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {link.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {link.description}
                </p>
                <button className="text-sm font-semibold text-cyan-600 dark:text-blue-400 hover:gap-2 flex items-center gap-1 transition-all">
                  {link.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find answers organized by topic
            </p>
          </div>

          <div className="space-y-12">
            {faqCategories.map((category, categoryIdx) => (
              <motion.div
                key={categoryIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIdx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, faqIdx) => {
                    const faqId = `${categoryIdx}-${faqIdx}`
                    const isOpen = openFAQ === faqId

                    return (
                      <div
                        key={faqIdx}
                        className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : faqId)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Our support team is here to help you succeed
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Live Chat
            </button>
            <Link
              href="mailto:support@cryptonomadhub.com"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Support
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            Average response time: 2 hours • Available 24/7
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
