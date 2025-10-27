'use client'

import Link from 'next/link'
import { Check, X, Zap, Crown, Rocket, Building2 } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for exploring crypto tax optimization',
      icon: Zap,
      features: [
        { text: '5 tax simulations/month', included: true },
        { text: '20 AI chat messages/month', included: true },
        { text: 'Access to 167 countries data', included: true },
        { text: 'DeFi audits', included: false },
        { text: 'PDF exports', included: false },
      ],
      cta: 'Get Started',
      href: '/auth/register',
    },
    {
      name: 'Starter',
      price: '$20',
      period: '/month',
      badge: 'POPULAR',
      description: 'Best for individual investors',
      icon: Crown,
      features: [
        { text: '50 tax simulations/month', included: true },
        { text: '200 AI chat messages/month', included: true },
        { text: '5 DeFi audits/month', included: true },
        { text: 'PDF report exports', included: true },
        { text: 'Priority email support', included: true },
      ],
      cta: 'Start Free Trial',
      href: '/auth/register',
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$50',
      period: '/month',
      badge: 'BEST VALUE',
      description: 'For professional traders',
      icon: Rocket,
      features: [
        { text: '500 tax simulations/month', included: true },
        { text: '2000 AI chat messages/month', included: true },
        { text: '50 DeFi audits/month', included: true },
        { text: 'Unlimited PDF exports', included: true },
        { text: 'Priority email support', included: true },
      ],
      cta: 'Start Free Trial',
      href: '/auth/register',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and businesses',
      icon: Building2,
      features: [
        { text: 'Unlimited everything', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantees', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Contact Sales',
      href: 'mailto:support@cryptonomadhub.io',
      dark: true,
    },
  ]

  return (
    <PublicPageLayout>
      
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Simple, Transparent{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                Pricing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees. Cancel anytime.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24">
            {plans.map((plan, index) => (
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
                      <span className={`text-5xl font-extrabold ${
                        plan.dark ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`text-lg ${
                          plan.dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`mb-6 ${
                      plan.dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    {plan.href.startsWith('mailto:') ? (
                      <a
                        href={plan.href}
                        className={`block w-full py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                          plan.dark
                            ? 'bg-white hover:bg-slate-100 text-slate-900'
                            : plan.highlight
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        }`}
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link
                        href={plan.href}
                        className={`block w-full py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                          plan.dark
                            ? 'bg-white hover:bg-slate-100 text-slate-900'
                            : plan.highlight
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>

                  {/* Features */}
                  <div className={`flex-1 p-6 sm:p-8 pt-0 border-t ${
                    plan.highlight
                      ? 'border-violet-200 dark:border-violet-800'
                      : plan.dark
                      ? 'border-slate-700'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              plan.dark
                                ? 'text-emerald-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`} />
                          ) : (
                            <X className="w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-600 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            plan.dark
                              ? 'text-slate-200'
                              : feature.included
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-500 dark:text-slate-500'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, you can cancel your subscription at any time from your account settings. No questions asked.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: "We don't offer refunds for partial months, but you can cancel at any time to prevent future charges."
                },
                {
                  q: 'How does billing work?',
                  a: 'Billing is monthly and automatic. All payments are processed securely through Paddle, our Merchant of Record.'
                },
                {
                  q: 'What happens if I exceed my limits?',
                  a: "You'll be notified when you reach 80% of your monthly quota. If you exceed limits, you'll need to upgrade to continue using the service."
                }
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                <strong className="font-bold">⚠️ Disclaimer:</strong> CryptoNomadHub is NOT financial, tax, or legal advice.
                All information provided is for educational purposes only. Consult with licensed tax professionals
                before making any financial decisions. See our{' '}
                <Link href="/terms" className="text-violet-600 dark:text-fuchsia-400 hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                for more details.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </PublicPageLayout>
  )
}
