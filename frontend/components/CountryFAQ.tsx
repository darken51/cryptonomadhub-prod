'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Country {
  country_code: string
  country_name: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  holding_period_months?: number
  is_territorial?: boolean
  exemption_threshold?: number
  exemption_threshold_currency?: string
}

interface FAQ {
  question: string
  answer: string
}

function generateFAQs(country: Country): FAQ[] {
  const shortRateNum = (country.crypto_short_rate ?? country.cgt_short_rate) * 100
  const longRateNum = (country.crypto_long_rate ?? country.cgt_long_rate) * 100
  const shortRate = shortRateNum.toFixed(1)
  const longRate = longRateNum.toFixed(1)
  const isZeroTax = shortRateNum === 0 && longRateNum === 0

  const faqs: FAQ[] = []

  // Q1: Basic tax rate (always)
  if (isZeroTax) {
    faqs.push({
      question: `Is cryptocurrency tax-free in ${country.country_name}?`,
      answer: `Yes, ${country.country_name} currently has 0% capital gains tax on cryptocurrency transactions. This means crypto trading, buying, and selling are tax-free. However, you should verify your residency status and other potential tax obligations (income tax, VAT, etc.).`
    })
  } else {
    faqs.push({
      question: `What is the crypto tax rate in ${country.country_name}?`,
      answer: `${country.country_name} applies a ${shortRate}% capital gains tax rate on short-term cryptocurrency gains${
        shortRateNum !== longRateNum
          ? ` and ${longRate}% on long-term gains`
          : ''
      }. This applies to profits from selling, trading, or exchanging cryptocurrency.`
    })
  }

  // Q2: Holding period (if applicable)
  if (country.holding_period_months) {
    faqs.push({
      question: `How long do I need to hold crypto in ${country.country_name} for long-term capital gains?`,
      answer: `In ${country.country_name}, you must hold cryptocurrency for at least ${country.holding_period_months} months to qualify for the long-term capital gains rate of ${longRate}%. Holdings sold before ${country.holding_period_months} months are taxed at ${shortRate}% (short-term rate).`
    })
  }

  // Q3: Exemption threshold (if applicable)
  if (country.exemption_threshold) {
    faqs.push({
      question: `Is there a tax-free allowance for crypto in ${country.country_name}?`,
      answer: `Yes, ${country.country_name} offers an annual tax exemption of ${country.exemption_threshold.toLocaleString()} ${country.exemption_threshold_currency || 'USD'}. Capital gains below this threshold are tax-free. Only gains exceeding this amount are subject to the ${shortRate}% tax rate.`
    })
  }

  // Q4: Legal status
  if (country.crypto_legal_status === 'banned') {
    faqs.push({
      question: `Is cryptocurrency legal in ${country.country_name}?`,
      answer: `Cryptocurrency is currently banned or heavily restricted in ${country.country_name}. Trading, holding, or transacting with crypto may be illegal or subject to significant penalties. Consult local legal counsel before engaging in any crypto activities.`
    })
  } else if (country.crypto_legal_status === 'legal') {
    faqs.push({
      question: `Is cryptocurrency legal in ${country.country_name}?`,
      answer: `Yes, cryptocurrency is legal in ${country.country_name}. The government recognizes crypto as a legitimate asset class, and individuals can legally buy, sell, trade, and hold cryptocurrency. Tax obligations apply to capital gains.`
    })
  }

  // Q5: Territorial tax (if applicable)
  if (country.is_territorial) {
    faqs.push({
      question: `Does ${country.country_name} have territorial taxation?`,
      answer: `Yes, ${country.country_name} operates a territorial tax system. This means only income generated within ${country.country_name} is taxed. Foreign-sourced cryptocurrency gains may be exempt from taxation, but specific rules apply depending on your residency status and source of income.`
    })
  }

  // Q6: Reporting requirements (generic but customized)
  faqs.push({
    question: `Do I need to report my crypto holdings in ${country.country_name}?`,
    answer: `Tax residents of ${country.country_name} are generally required to report cryptocurrency holdings and transactions${
      isZeroTax
        ? ', even though gains are currently tax-free'
        : ` when filing annual tax returns`
    }. Specific reporting thresholds and forms vary. Consult a local tax advisor for compliance requirements.`
  })

  // Q7: Staking/DeFi (generic)
  if (!isZeroTax) {
    faqs.push({
      question: `How is crypto staking taxed in ${country.country_name}?`,
      answer: `Staking rewards in ${country.country_name} are typically taxed as income when received, at your applicable income tax rate. When you later sell staked tokens, any capital gains are subject to the ${shortRate}% capital gains rate. Tax treatment may vary for DeFi activities—consult a crypto tax specialist.`
    })
  } else {
    faqs.push({
      question: `Is crypto staking tax-free in ${country.country_name}?`,
      answer: `With 0% capital gains tax in ${country.country_name}, selling staked crypto is tax-free. However, staking rewards may be treated as income and subject to income tax when received. The exact treatment depends on local tax authority guidance—verify with a tax professional.`
    })
  }

  // Q8: Digital nomads/Residency
  faqs.push({
    question: `Can digital nomads benefit from ${country.country_name}'s crypto tax laws?`,
    answer: `To benefit from ${country.country_name}'s ${
      isZeroTax ? '0% crypto tax' : 'crypto tax rates'
    }, you typically need to establish tax residency. This usually requires spending 183+ days per year in ${country.country_name} and/or obtaining a residence permit. Consult an immigration attorney for visa and residency requirements.`
  })

  return faqs
}

export default function CountryFAQ({ country }: { country: Country }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // First question open by default
  const faqs = generateFAQs(country)

  // Generate FAQPage JSON-LD for search engines and AI
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://cryptonomadhub.io/countries/${country.country_code.toLowerCase()}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <>
      {/* JSON-LD for AI and search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 italic">
          Have more questions? <a href="/help" className="text-cyan-600 hover:underline">Contact our crypto tax experts</a> or use our <a href="/features/ai-chat" className="text-cyan-600 hover:underline">AI assistant</a> for personalized guidance.
        </p>
      </div>
    </>
  )
}
