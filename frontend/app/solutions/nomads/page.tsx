'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Globe, Map, TrendingUp, Shield, CheckCircle, Heart, Plane, Home, DollarSign, Trophy } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function DigitalNomadsPage() {
  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "For Digital Nomads - Crypto Tax Optimization",
            "description": "Find the perfect country for your digital nomad lifestyle. AI-powered country scoring evaluates 167 countries on crypto tax rates AND quality of life.",
            "url": "https://cryptonomadhub.com/solutions/nomads"
          })
        }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-blue-900/30 text-cyan-700 dark:text-blue-300 text-sm font-bold mb-6">
              <Plane className="w-4 h-4" />
              FOR DIGITAL NOMADS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Find Your Perfect</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Nomad Destination
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              The only platform that scores countries on <strong>crypto tax rates</strong> AND <strong>quality of life for nomads</strong>. Find the perfect balance.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/countries"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Explore 167 Countries
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-cyan-600 dark:hover:border-blue-400 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Nomads Love Us */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Built for Digital Nomads
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We understand you need more than just tax rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: 'AI Nomad Score (0-100)',
                description: 'Unique scoring system that evaluates cost of living, visa accessibility, infrastructure, and expat community for every country.',
                gradient: 'from-amber-500 to-orange-600'
              },
              {
                icon: DollarSign,
                title: 'Tax + QoL Balance',
                description: 'Find countries with low crypto taxes AND great quality of life. Portugal (0% crypto tax) vs Singapore (0% tax + higher costs) - compare everything.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Map,
                title: 'Visa Requirements',
                description: 'See visa rules, residency requirements, and digital nomad visa programs for all 167 countries. 183-day rule tracking included.',
                gradient: 'from-violet-500 to-fuchsia-600'
              },
              {
                icon: Home,
                title: 'Cost of Living Data',
                description: 'Housing, food, healthcare costs factored into Nomad Score. See actual living costs vs potential tax savings.',
                gradient: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Heart,
                title: 'Expat Community',
                description: 'English proficiency, expat community size, networking opportunities - all evaluated by AI for each country.',
                gradient: 'from-pink-500 to-rose-600'
              },
              {
                icon: Shield,
                title: 'Multi-Country Compare',
                description: 'Compare 2-5 countries side-by-side. See tax savings, QoL scores, visa requirements all in one view. Make informed decisions.',
                gradient: 'from-indigo-500 to-purple-600'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Common Nomad Scenarios
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              How we help digital nomads optimize their taxes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                scenario: '🇺🇸 → 🇵🇹',
                title: 'US Citizen Moving to Portugal',
                description: 'Portugal has 0% crypto tax (for now) but you still need to report to IRS. Our AI helps you understand US citizenship-based taxation + Portuguese residency requirements.',
                savings: 'Potential: 20-37% tax savings'
              },
              {
                scenario: '🌍 → 🇦🇪',
                title: 'Nomad Relocating to Dubai',
                description: 'UAE has 0% personal income tax and crypto-friendly regulations. We compare visa costs, cost of living, and help determine if the move makes financial sense.',
                savings: 'Potential: 30%+ tax savings'
              },
              {
                scenario: '🇩🇪 → 🇪🇸',
                title: 'EU Citizen Optimizing Within EU',
                description: 'Move from Germany (26% crypto tax) to Spain (19%) or Cyprus (0% long-term). Compare quality of life, visa requirements, and actual tax savings.',
                savings: 'Potential: 7-26% tax savings'
              },
              {
                scenario: '🛫 Multi-Country',
                title: 'Perpetual Traveler Strategy',
                description: 'Spend less than 183 days in multiple countries to avoid tax residency. Our dashboard tracks your days per country and alerts you before triggering tax residency.',
                savings: 'Avoid full residency tax'
              }
            ].map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-cyan-200 dark:border-blue-800 hover:border-cyan-400 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-3xl mb-3">{useCase.scenario}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {useCase.description}
                </p>
                <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold">
                  {useCase.savings}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Nomads */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Tools built specifically for location-independent crypto holders
            </p>
          </div>

          <div className="space-y-4">
            {[
              { feature: 'Interactive World Map', description: 'Click any country to see full tax details + AI scores' },
              { feature: 'Multi-Country Comparison', description: 'Compare 2-5 countries side-by-side with identical calculations' },
              { feature: 'AI Chat Assistant', description: 'Ask: "Best countries for US citizen with $100k crypto gains?"' },
              { feature: 'Tax Simulations', description: 'Calculate exact savings: current country vs target destination' },
              { feature: 'Residency Rule Tracker', description: 'Track 183-day rule to avoid accidental tax residency' },
              { feature: 'Treaty Information', description: 'See tax treaty countries to avoid double taxation' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl border border-cyan-200 dark:border-blue-800"
              >
                <CheckCircle className="w-6 h-6 text-cyan-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.feature}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Common Questions from Digital Nomads
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Everything you need to know about crypto tax optimization while traveling
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">🗺️</span>
                What is the 183-day rule and why does it matter?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Most countries consider you a tax resident if you spend 183 days or more per year within their borders. This means you&apos;ll owe taxes on your worldwide income to that country. However, the rule varies: some count partial days, others have &quot;center of vital interests&quot; tests (where your family/property is), and some tie it to permanent address. CryptoNomadHub tracks all 167 country variations and can alert you 30 days before you risk triggering unwanted tax residency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">🛂</span>
                Can I be tax resident nowhere (perpetual traveler)?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Technically yes - stay under 183 days everywhere and you might avoid tax residency anywhere. However, this &quot;flag theory&quot; strategy has major drawbacks:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Your citizenship country may still tax you on worldwide income (US, Eritrea)
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Banks and exchanges require proof of tax residency to open accounts
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Some countries have anti-avoidance rules that override the 183-day test
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  You can&apos;t get residency certificates needed for tax treaty benefits
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                <strong>Better strategy:</strong> Establish official residency in a 0% crypto tax country (UAE, Portugal, Singapore, Panama) for legitimacy while maintaining freedom to travel.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">💰</span>
                How much does it cost to relocate for tax optimization?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Costs vary dramatically by country. Here are realistic estimates for popular destinations:
              </p>
              <div className="space-y-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">Budget Options ($1,000-$2,000/mo)</div>
                  <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>• Panama: $1,200/mo living + $5,000 Friendly Nations visa</li>
                    <li>• Portugal: $900/mo living + €7,500 D7 visa (freelancer/passive income)</li>
                    <li>• Malaysia: $1,500/mo + $35,000 MM2H deposit (refundable)</li>
                    <li>• Georgia: $800/mo + free 1-year visa for 95+ countries</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">Premium Options ($2,500-$5,000/mo)</div>
                  <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <li>• UAE Dubai: $3,500/mo + free remote work visa (2-year renewable)</li>
                    <li>• Singapore: $3,000/mo + EntrePass (entrepreneurs, $50k capital)</li>
                    <li>• Malta: $2,800/mo + €10,000/yr nomad visa</li>
                  </ul>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                <strong>Break-even calculation:</strong> If you&apos;re saving $30k+/year on crypto taxes, even premium destinations pay for themselves in 3-6 months.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">🇺🇸</span>
                I&apos;m a US citizen - can I escape crypto taxes by moving abroad?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Unfortunately, US citizens are taxed on worldwide income regardless of where they live. However, you still have significant optimization opportunities:
              </p>
              <div className="space-y-2 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Foreign Earned Income Exclusion (FEIE)</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Exclude $120,000 of foreign earned income if you pass the physical presence test (330+ days outside US)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Foreign Tax Credit (FTC)</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deduct foreign taxes paid from US tax liability (useful if residing in moderate-tax countries)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">State Tax Elimination</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Establish residency in no-tax states (FL, TX, WY, NV) before leaving US to avoid 5-13% state taxes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">★</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Puerto Rico Act 60</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Move to Puerto Rico (US territory) for 0% crypto gains tax if you&apos;re a bona fide PR resident (183+ days/year). No passport change needed.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">!</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Expatriation (Renouncing Citizenship)</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Extreme option: Renounce US citizenship ($2,350 fee + exit tax on unrealized gains &gt;$2M net worth). Permanent and irreversible.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">⚖️</span>
                Do I need a tax advisor or can CryptoNomadHub replace one?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                CryptoNomadHub is a research and planning tool, not a replacement for professional tax advice. Here&apos;s how we fit into your workflow:
              </p>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-violet-200 dark:border-violet-800 mb-3">
                <div className="font-bold text-violet-700 dark:text-violet-300 mb-2">✅ What CryptoNomadHub does:</div>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>• Identify best countries for your situation in 60 seconds</li>
                  <li>• Compare tax rates, costs, visas across 167 countries</li>
                  <li>• Calculate theoretical tax savings</li>
                  <li>• Track residency days to avoid triggering unwanted tax obligations</li>
                  <li>• Provide data-driven recommendations backed by official sources</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="font-bold text-amber-700 dark:text-amber-300 mb-2">⚠️ When you need a tax advisor:</div>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 ml-4">
                  <li>• Filing actual tax returns in multiple jurisdictions</li>
                  <li>• Structuring holding companies or trusts</li>
                  <li>• Handling complex situations (dual citizenship, existing tax residency disputes)</li>
                  <li>• Estate planning and wealth transfer strategies</li>
                  <li>• Audit representation or tax dispute resolution</li>
                </ul>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                <strong>Recommended approach:</strong> Use CryptoNomadHub to identify your top 2-3 country options (saves you 20+ hours of research), then consult a cross-border tax advisor for implementation. Typical advisor cost: $2k-5k for relocation planning vs $50k-200k+ in annual tax savings.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-2xl">🏦</span>
                How do I prove tax residency to banks and exchanges?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Banks, crypto exchanges, and financial institutions require proof of tax residency for KYC/AML compliance. Accepted documents typically include:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-500 font-bold">1.</span>
                  <div><strong>Tax Residency Certificate</strong> - Official document from your tax authority confirming where you&apos;re tax resident (most reliable)</div>
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-500 font-bold">2.</span>
                  <div><strong>Residency Visa/Permit</strong> - Long-term visa showing legal right to reside (UAE residence visa, Portugal D7, etc.)</div>
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-500 font-bold">3.</span>
                  <div><strong>Utility Bills</strong> - 2-3 months of electricity/water/internet bills in your name at local address</div>
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-500 font-bold">4.</span>
                  <div><strong>Lease Agreement</strong> - Rental contract showing minimum 6-12 month commitment</div>
                </li>
                <li className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-violet-500 font-bold">5.</span>
                  <div><strong>Local Bank Account Statement</strong> - Proof of local financial ties</div>
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                <strong>Pro tip:</strong> Don&apos;t rely on &quot;digital nomad&quot; visas (Bali, Mexico, etc.) as sole proof - they&apos;re often tourist visas that don&apos;t establish true tax residency. Choose countries where you can get official tax resident status.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Nomad Tax Optimization
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join digital nomads using AI to find the perfect country for taxes + lifestyle
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/countries"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl transition-all"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Countries
            </Link>
          </div>

          <p className="text-white/80 text-sm mt-6">
            No credit card required • 7-day free trial • 167 countries analyzed
          </p>
        </div>
      </section>
    </PublicPageLayout>
  )
}
