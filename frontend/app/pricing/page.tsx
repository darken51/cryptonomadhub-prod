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
      description: 'Découvrez CryptoNomadHub gratuitement',
      icon: Zap,
      features: [
        { text: '167 countries database (lecture)', included: true },
        { text: 'Comparaison 2 pays max', included: true },
        { text: '3 tax simulations/mois', included: true },
        { text: '2 DeFi audits/mois (no PDF)', included: true },
        { text: '10 AI chat messages/mois', included: true },
        { text: 'Export PDF', included: false },
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
      description: 'Pour investisseurs crypto actifs',
      icon: Crown,
      features: [
        { text: 'Comparaison jusqu\'à 5 pays', included: true },
        { text: '50 tax simulations/mois', included: true },
        { text: '15 DeFi audits/mois + PDF', included: true },
        { text: '100 AI chat messages/mois', included: true },
        { text: 'Cost basis: 1 méthode (1k tx/an)', included: true },
        { text: '3 wallets (sync 24h)', included: true },
        { text: 'Portfolio: 20 cryptos', included: true },
        { text: 'Email support', included: true },
      ],
      cta: 'Start 14-Day Trial',
      href: '/auth/register',
      highlight: true,
    },
    {
      name: 'Pro',
      monthlyPrice: 39,
      annualPrice: 374,
      badge: 'BEST VALUE',
      description: 'Pour traders pro & nomades',
      icon: Rocket,
      features: [
        { text: 'Comparaison jusqu\'à 10 pays', included: true },
        { text: 'Tax simulations illimitées', included: true },
        { text: '100 DeFi audits/mois + CSV/JSON', included: true },
        { text: '500 AI messages/mois (contextualisés)', included: true },
        { text: 'Cost basis: toutes méthodes (50k tx)', included: true },
        { text: 'Tax Optimizer IA 🔥', included: true },
        { text: '15 wallets (sync 24h)', included: true },
        { text: 'Portfolio illimité + analytics', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Start 14-Day Trial',
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      customPrice: 'Sur devis',
      description: 'Cabinets, équipes, institutions',
      icon: Building2,
      features: [
        { text: 'Tout du Pro + Illimité', included: true },
        { text: 'API Access complète + webhooks', included: true },
        { text: '5-100+ utilisateurs', included: true },
        { text: 'Intégrations QuickBooks/Xero', included: true },
        { text: 'White-label (option)', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA 99.9% + Priority support', included: true },
        { text: 'Custom features sur demande', included: true },
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@cryptonomadhub.io',
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
    if (billingCycle === 'monthly') return '/mois'
    return '/an'
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
              Tarifs simples,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                transparents
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choisissez le plan adapté à vos besoins. Sans engagement. Annulez quand vous voulez.
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
              Mensuel
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
              Annuel
            </span>
            {billingCycle === 'annual' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full"
              >
                Économisez 20%
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
                            Économisez ${savings.amount}/an
                          </p>
                        )}
                        {billingCycle === 'monthly' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ou ${plan.annualPrice}/an (-20%)
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
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont appliqués immédiatement et facturés au prorata.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Quelle est la politique d'annulation ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Aucun engagement. Annulez à tout moment depuis votre dashboard. Les plans mensuels ne seront pas renouvelés, les plans annuels restent actifs jusqu'à la fin de la période payée.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Qu'est-ce qui est inclus dans le Free trial ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  14 jours d'essai gratuit sur les plans Starter et Pro, sans carte bancaire requise. Accès complet à toutes les fonctionnalités du plan choisi.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Comment fonctionne le plan Enterprise ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Le plan Enterprise est personnalisé selon vos besoins (nombre d'utilisateurs, volume d'API calls, intégrations spécifiques). Prix sur devis à partir de $300/mois.
                </p>
                <Link
                  href="mailto:sales@cryptonomadhub.io"
                  className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  Contactez notre équipe sales
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Les données des 167 pays sont-elles accessibles gratuitement ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Oui ! Notre base de données complète des 167 pays avec analyses IA et scoring est accessible publiquement pour favoriser la transparence fiscale. Les plans payants débloquent les fonctionnalités avancées (comparaisons illimitées, export PDF, audits DeFi, Tax Optimizer...).
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
              Prêt à optimiser vos impôts crypto ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'investisseurs qui économisent en moyenne $127k/an
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
            >
              Commencer gratuitement
            </Link>
          </motion.div>
        </div>
      </main>
    </PublicPageLayout>
  )
}
