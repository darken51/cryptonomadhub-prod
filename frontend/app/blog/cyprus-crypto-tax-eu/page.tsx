'use client'

import Link from 'next/link'
import { ArrowLeft, Globe, Calendar, TrendingUp, Shield } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function CyprusCryptoTaxBlogPost() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-4">
              Country Spotlight
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Cyprus 0% Crypto Tax: The EU's Hidden Gem
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>November 5, 2024</span>
              </div>
              <span>8 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> Cyprus offers 0% tax on crypto capital gains for passive investors, is an EU member with English widely spoken, and has a low cost of living. Active traders may face 0-35% income tax. Residency is easier than most EU countries.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Why Cyprus?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Cyprus is one of the most underrated crypto-friendly countries in Europe. Here's why it stands out:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Tax Advantages
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• <strong>0% capital gains tax</strong> on crypto (if not trading business)</li>
                  <li>• No wealth tax or inheritance tax</li>
                  <li>• 12.5% corporate tax (one of EU's lowest)</li>
                  <li>• 60-day tax residency rule (non-dom)</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Lifestyle Benefits
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• EU member (Euro, Schengen access)</li>
                  <li>• English widely spoken (former British colony)</li>
                  <li>• Mediterranean climate (300+ sunny days)</li>
                  <li>• Low cost of living vs Western Europe</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Cyprus Crypto Tax System</h2>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">The Critical Distinction: Investor vs Trader</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Cyprus does <strong>not have capital gains tax</strong> except for real estate and shares in companies owning Cypriot property. Crypto doesn't fall into these categories, so:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-5 border-2 border-emerald-300 dark:border-emerald-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    ✓ Passive Investor (0% Tax)
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    <strong>You qualify if you:</strong>
                  </p>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Buy and hold crypto long-term</li>
                    <li>• Trade infrequently (few times per year)</li>
                    <li>• Don't use leverage/margin</li>
                    <li>• Not operating as a business</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-emerald-300 dark:border-emerald-700">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">Tax: 0%</div>
                  </div>
                </div>

                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-5 border-2 border-amber-300 dark:border-amber-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    ⚠ Active Trader (0-35% Tax)
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    <strong>You may be classified if you:</strong>
                  </p>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Day trade frequently</li>
                    <li>• Use leverage/margin trading</li>
                    <li>• Operate on multiple exchanges</li>
                    <li>• DeFi, staking, yield farming</li>
                    <li>• Mining operations</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                    <div className="font-bold text-amber-700 dark:text-amber-400">Tax: 0-35% income tax</div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Cyprus Income Tax Rates (If Trading)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If your crypto activity is classified as a business/trading, you'll pay progressive income tax:
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Annual Income</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Tax Rate</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Example Tax</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€0 - €19,500</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold text-emerald-600">0%</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€0</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€19,501 - €28,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">20%</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€1,700 on €28k</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€28,001 - €36,300</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">25%</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€3,775 on €36.3k</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€36,301 - €60,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">30%</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€10,885 on €60k</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€60,001+</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">35%</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">€21,135 on €100k</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Non-Dom Status: 60-Day Rule</h2>

            <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-violet-900 dark:text-violet-300 mb-3">Special Tax Regime for Non-Domiciled Residents</h3>
              <p className="text-violet-800 dark:text-violet-200 mb-4">
                Cyprus offers a unique <strong>"non-dom" status</strong> that provides additional tax benefits:
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Become Tax Resident in Just 60 Days</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  You qualify as a Cyprus tax resident if you meet <strong>both</strong> conditions:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>✓ Spend at least <strong>60 days</strong> in Cyprus per year</li>
                  <li>✓ Not tax resident in any other country for {'>'}183 days</li>
                  <li>✓ Have a residence in Cyprus (own or rent)</li>
                  <li>✓ Maintain business or employment ties to Cyprus</li>
                </ul>
              </div>

              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-5">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Non-Dom Benefits:</h4>
                <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                  <li>• <strong>0% tax on dividends</strong> (from worldwide sources)</li>
                  <li>• <strong>0% tax on interest income</strong></li>
                  <li>• <strong>No Special Defence Contribution (SDC)</strong> on dividends/interest</li>
                  <li>• Status valid for <strong>17 years</strong> after becoming resident</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Examples</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Example 1: Long-Term HODLer</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div><strong>Profile:</strong> Sarah holds Bitcoin, Ethereum, Solana long-term. Rebalances portfolio 2-3 times per year.</div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mt-2">
                    <div><strong>Crypto Activity:</strong> Passive investor</div>
                    <div><strong>2025 Crypto Gains:</strong> €200,000</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold mt-2">Tax: €0 (0% capital gains)</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Example 2: Day Trader</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div><strong>Profile:</strong> John trades crypto daily on Binance, Bybit. Uses leverage. 50+ trades per month.</div>
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 mt-2">
                    <div><strong>Crypto Activity:</strong> Active trading (business)</div>
                    <div><strong>2025 Trading Profit:</strong> €100,000</div>
                    <div className="text-red-700 dark:text-red-400 font-bold mt-2">Tax: €21,135 (progressive income tax)</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Example 3: Hybrid Strategy</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div><strong>Profile:</strong> Maria has €500k in long-term crypto holdings + small trading account for active trades.</div>
                  <div className="bg-gradient-to-r from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg p-3 mt-2">
                    <div><strong>Long-term gains:</strong> €150,000 → Tax: €0</div>
                    <div><strong>Trading gains:</strong> €30,000 → Tax: €3,775</div>
                    <div className="font-bold mt-2">Total Tax: €3,775 on €180,000 (<strong>2.1% effective rate</strong>)</div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Become a Cyprus Tax Resident</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">Step-by-Step Process:</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span><strong>Get a residence permit:</strong> Register a company in Cyprus, or show employment, or invest €300k+ in real estate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span><strong>Rent or buy property:</strong> Establish a physical residence (can be a small apartment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span><strong>Spend 60+ days in Cyprus:</strong> Track your days carefully (flights, hotel receipts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span><strong>Avoid 183+ days elsewhere:</strong> Don't become tax resident in another country</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                  <span><strong>Register with tax authorities:</strong> Get a Cyprus Tax Identification Number (TIN)</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Cost of Living in Cyprus</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Rent (1BR, city center)</h4>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">€600-1,000</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Nicosia, Limassol</div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Monthly Living</h4>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">€1,200-1,800</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Food, transport, utilities</div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Healthcare</h4>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">€50-150</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Private insurance/month</div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Cyprus vs Other EU Crypto Havens</h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Country</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Crypto Tax</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Residency</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Living Cost</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">🇨🇾 Cyprus</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-emerald-600 font-bold">0% (passive)</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">60 days</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">Low-Medium</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">🇵🇹 Portugal</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">0% {'>'}365 days</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">183 days</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">Low-Medium</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">🇲🇹 Malta</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">0% (non-dom)</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">183 days</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">Medium</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">🇩🇪 Germany</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">0% {'>'}1 year*</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">183 days</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">High</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">* May change to 30% flat tax</p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Cyprus is an excellent choice for crypto holders who:
            </p>

            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>Want to stay in the EU with Euro currency</li>
              <li>Are long-term investors (buy and hold)</li>
              <li>Prefer English-speaking Mediterranean country</li>
              <li>Want lower cost of living than Western Europe</li>
              <li>Need easy residency (60-day rule)</li>
            </ul>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              However, be aware that <strong>active traders will pay income tax (0-35%)</strong>. If you trade frequently, consider UAE or Singapore for true 0% regardless of activity level.
            </p>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Always consult with a Cyprus tax advisor</strong> to ensure your activity qualifies as passive investment and not trading business.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Compare Cyprus with 162 Other Countries</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Use our AI-powered tool to compare Cyprus's crypto tax system with every other country in the world.
              </p>
              <Link
                href="/countries"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                Explore 167 Countries
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
