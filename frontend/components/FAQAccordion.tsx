'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Is this legal? Can I really optimize my crypto taxes this way?',
    answer: 'Yes! Tax residency optimization is completely legal. CryptoNomadHub provides educational tools and simulations based on official tax data from 167 countries. We help you understand different jurisdictions, but you should always consult a licensed tax professional before making any residency changes. Our platform is for informational purposes only.'
  },
  {
    question: 'Which countries do you support?',
    answer: 'We support 167 countries worldwide, making us the most comprehensive crypto tax platform available. This includes all major jurisdictions like the US, UK, EU countries, UAE, Singapore, Australia, Canada, and over 150 others. Each country has official tax rate data, treaty information, and residency requirements.'
  },
  {
    question: 'How accurate are your tax rate calculations?',
    answer: 'Our tax rates are sourced from official government publications, international tax organizations (OECD, Tax Foundation), and reputable tax advisories (PwC, Koinly, KPMG). We update our database regularly and maintain an audit trail of all changes. However, tax laws change frequently, so we always recommend verifying with a local tax professional.'
  },
  {
    question: 'Can I import transactions from exchanges like Binance and Coinbase?',
    answer: 'Yes! We support direct API integration with major exchanges including Binance, Coinbase, and Kraken. You can also import transactions via CSV for any exchange or wallet. Our system automatically categorizes transactions, calculates cost basis using FIFO/LIFO/HIFO methods, and handles complex scenarios like wash sales.'
  },
  {
    question: 'Do you support DeFi protocols and NFTs?',
    answer: 'Absolutely! Our DeFi audit feature analyzes on-chain activity across 40+ protocols including Uniswap, Aave, Compound, and more. We also detect NFT transactions, airdrops, and staking rewards. The platform automatically identifies protocol interactions and calculates tax implications for each transaction type.'
  },
  {
    question: 'What reports can I export?',
    answer: 'You can export professional tax reports in multiple formats: PDF (comprehensive report with charts), Excel (detailed transaction history), CSV (raw data), and TurboTax import format. All reports include full calculation transparency, source references, and legal disclaimers. Perfect for submitting to accountants or tax authorities.'
  }
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Everything you need to know about CryptoNomadHub
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <span className="font-semibold text-slate-900 dark:text-white pr-8">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Still have questions?
        </p>
        <a
          href="mailto:support@cryptonomadhub.io"
          className="text-violet-600 dark:text-fuchsia-400 hover:text-violet-700 dark:hover:text-fuchsia-300 font-semibold underline inline-block"
        >
          Contact Support →
        </a>
      </div>
    </div>
  )
}
