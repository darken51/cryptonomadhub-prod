'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Rocket, Building2, Mail } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Get started with CryptoNomadHub',
      icon: Zap,
      features: [
        { text: '167 countries database (read-only)', included: true },
        { text: 'Compare up to 2 countries', included: true },
        { text: '3 tax simulations/month', included: true },
        { text: '2 DeFi audits/month (no PDF)', included: true },
        { text: '10 AI chat messages/month', included: true },
        { text: 'PDF export', included: false },
        { text: 'Cost basis tracking', included: false },
        { text: 'Wallet connect', included: false },
      ],
      cta: 'Start Free',
      href: '/auth/register',
    },
    {
      name: 'Starter',
      monthlyPrice: 15,
      annualPrice: 144,
      badge: 'POPULAR',
      description: 'For active crypto investors',
      icon: Crown,
      features: [
        { text: 'Compare up to 5 countries', included: true },
        { text: '50 tax simulations/month', included: true },
        { text: '15 DeFi audits/month + PDF', included: true },
        { text: '100 AI chat messages/month', included: true },
        { text: 'Cost basis: 1 method (1k tx/year)', included: true },
        { text: '3 wallets (24h sync)', included: true },
        { text: 'Portfolio: 20 cryptos', included: true },
        { text: 'Email support', included: true },
      ],
      cta: 'Get Started',
      href: '/auth/register',
      highlight: true,
    },
    {
      name: 'Pro',
      monthlyPrice: 39,
      annualPrice: 374,
      badge: 'BEST VALUE',
      description: 'For pro traders & digital nomads',
      icon: Rocket,
      features: [
        { text: 'Compare up to 10 countries', included: true },
        { text: 'Unlimited tax simulations', included: true },
        { text: '100 DeFi audits/month + CSV', included: true },
        { text: '500 AI messages/month (contextualized)', included: true },
        { text: 'Cost basis: all methods (50k tx)', included: true },
        { text: 'Tax Optimizer AI 🔥', included: true },
        { text: '15 wallets (24h sync)', included: true },
        { text: 'Unlimited portfolio + analytics', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Get Started',
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      customPrice: 'Custom',
      description: 'For firms, teams & institutions',
      icon: Building2,
      features: [
        { text: 'Everything in Pro + Unlimited', included: true },
        { text: 'Full API access + webhooks', included: true },
        { text: '5-100+ users', included: true },
        { text: 'QuickBooks/Xero integrations', included: true },
        { text: 'White-label (optional)', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '99.9% SLA + Priority support', included: true },
        { text: 'Custom features on demand', included: true },
      ],
      cta: 'Contact Sales',
      href: 'mailto:contact@cryptonomadhub.io',
      dark: true,
    },
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.customPrice) return plan.customPrice
    if (billingCycle === 'monthly') return `$${plan.monthlyPrice}`
    return `$${plan.annualPrice}`
  }

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.customPrice) return ''
    if (billingCycle === 'monthly') return '/mo'
    return '/yr'
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (!plan.monthlyPrice || !plan.annualPrice) return null
    const monthlyCost = plan.monthlyPrice * 12
    const savings = monthlyCost - plan.annualPrice
    const percentSaved = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percent: percentSaved }
  }

  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CryptoNomadHub",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "Crypto tax optimization platform for digital nomads with multi-jurisdiction support",
            "url": "https://cryptonomadhub.io",
            "offers": [
              {
                "@type": "Offer",
                "name": "Free Plan",
                "price": "0",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD",
                  "billingDuration": "P1M"
                },
                "description": "Free forever plan with 167 countries database access, 3 tax simulations/month, 2 DeFi audits, and 10 AI chat messages",
                "url": "https://cryptonomadhub.io/auth/register",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "CryptoNomadHub"
                }
              },
              {
                "@type": "Offer",
                "name": "Starter Plan",
                "price": "15",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "15",
                  "priceCurrency": "USD",
                  "billingDuration": "P1M"
                },
                "description": "Best for individual investors with 50 simulations/month, 15 DeFi audits, cost basis tracking, and 100 AI messages",
                "url": "https://cryptonomadhub.io/auth/register",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "CryptoNomadHub"
                }
              },
              {
                "@type": "Offer",
                "name": "Pro Plan",
                "price": "39",
                "priceCurrency": "USD",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "39",
                  "priceCurrency": "USD",
                  "billingDuration": "P1M"
                },
                "description": "For professional traders with unlimited simulations, 100 DeFi audits, Tax Optimizer AI, and 500 AI messages",
                "url": "https://cryptonomadhub.io/auth/register",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "CryptoNomadHub"
                }
              },
              {
                "@type": "Offer",
                "name": "Enterprise Plan",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Custom pricing for teams and businesses with API access, unlimited features, dedicated support, and SLA guarantees",
                "url": "mailto:sales@cryptonomadhub.io",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "CryptoNomadHub"
                }
              }
            ]
          })
        }}
      />
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Simple,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                transparent
              </span>
              {' '}pricing
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. No commitment. Cancel anytime.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center items-center gap-4 mb-12"
          >
            <span className={`text-sm font-semibold transition-colors ${
              billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 bg-slate-200 dark:bg-slate-700"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${
              billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full"
              >
                Save 20%
              </motion.span>
            )}
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24">
            {plans.map((plan, index) => {
              const savings = getSavings(plan)

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative ${plan.highlight ? 'lg:-mt-4' : ''}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="px-4 py-1 text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div
                    className={`h-full flex flex-col rounded-2xl border transition-all ${
                      plan.highlight
                        ? 'border-violet-500 shadow-2xl shadow-violet-500/20 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30'
                        : plan.dark
                        ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg'
                    }`}
                  >
                    <div className="p-6 sm:p-8">
                      {/* Icon & Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`p-3 rounded-xl ${
                          plan.highlight
                            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
                            : plan.dark
                            ? 'bg-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <plan.icon className={`w-6 h-6 ${
                            plan.highlight || plan.dark ? 'text-white' : 'text-violet-600 dark:text-fuchsia-400'
                          }`} />
                        </div>
                        {plan.badge && !plan.highlight && (
                          <span className="px-2 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className={`text-2xl font-bold mb-2 ${
                        plan.dark ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {plan.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-5xl font-extrabold ${
                            plan.dark ? 'text-white' : 'text-slate-900 dark:text-white'
                          }`}>
                            {getPrice(plan)}
                          </span>
                          <span className={`text-lg ${
                            plan.dark ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {getPeriod(plan)}
                          </span>
                        </div>
                        {savings && billingCycle === 'annual' && (
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            Save ${savings.amount}/year
                          </p>
                        )}
                        {billingCycle === 'monthly' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            or ${plan.annualPrice}/year (-20%)
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <p className={`text-sm mb-6 ${
                        plan.dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {plan.description}
                      </p>

                      {/* CTA Button */}
                      <Link
                        href={plan.href}
                        className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-lg hover:shadow-xl'
                            : plan.dark
                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </div>

                    {/* Features List */}
                    <div className="flex-1 px-6 sm:px-8 pb-8">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                plan.dark ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`} />
                            ) : (
                              <X className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                plan.dark ? 'text-slate-500' : 'text-slate-400 dark:text-slate-600'
                              }`} />
                            )}
                            <span className={`text-sm ${
                              feature.included
                                ? plan.dark ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                                : plan.dark ? 'text-slate-500' : 'text-slate-400 dark:text-slate-600'
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes are applied immediately and billed on a prorated basis.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  What is the cancellation policy?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  No commitment. Cancel anytime from your dashboard. Monthly plans won't be renewed, annual plans remain active until the end of the paid period.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  What's included in the free trial?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  14-day free trial on Starter and Pro plans, no credit card required. Full access to all features of your chosen plan.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  How does the Enterprise plan work?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  The Enterprise plan is customized to your needs (number of users, API volume, specific integrations). Custom pricing starting from $300/month.
                </p>
                <Link
                  href="mailto:sales@cryptonomadhub.io"
                  className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  Contact our sales team
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Is the 167 countries data accessible for free?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! Our complete database of 167 countries with AI analysis and scoring is publicly accessible to promote tax transparency. Paid plans unlock advanced features (unlimited comparisons, PDF export, DeFi audits, Tax Optimizer...).
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-24 text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to optimize your crypto taxes?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of investors saving an average of $127k/year
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </main>
    </PublicPageLayout>
  )
}
