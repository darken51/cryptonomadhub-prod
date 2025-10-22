'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle, TrendingDown, Calendar } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function PortugalCryptoTaxBlogPost() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-4">
              Tax News
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Portugal Crypto Tax 2025: What Digital Nomads Need to Know
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>October 19, 2025</span>
              </div>
              <span>8 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> Portugal still offers 0% tax on long-term crypto gains (held over 365 days), but introduced a 28% tax on short-term gains in 2023. Here's the complete guide to Portugal's crypto tax system and why it remains attractive for buy-and-hold investors.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Portugal's Current Crypto Tax System</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Portugal was a complete crypto tax haven from 2018-2022, when the Portuguese Tax Authority (AT) ruled that cryptocurrency gains from individual investors are <strong>not subject to capital gains tax or VAT</strong>. This made Portugal one of the most attractive destinations for digital nomads and crypto traders in Europe.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              However, in <strong>2023, Portugal introduced new crypto tax rules</strong> that distinguish between short-term and long-term holdings. The good news? Long-term investors still enjoy 0% tax.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Current Tax Rules (Since 2023)</h3>
                  <ul className="space-y-2 text-emerald-800 dark:text-emerald-200 mb-0">
                    <li>• <strong>0% tax</strong> on crypto held <strong>over 365 days</strong></li>
                    <li>• <strong>28% capital gains tax</strong> on crypto held <strong>under 365 days</strong></li>
                    <li>• <strong>28% tax</strong> on staking rewards and passive income</li>
                    <li>• Crypto-to-crypto swaps <strong>reset the holding period</strong></li>
                    <li>• Professional traders taxed at <strong>14.5%-53%</strong> progressive income tax</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The 365-Day Rule Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              The key to tax-free crypto gains in Portugal is simple: <strong>hold for at least 365 days</strong>. Here's how it works:
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✓</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Scenario 1: Buy and Hold (Tax-Free)</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">You buy 1 BTC on Jan 1, 2024. You sell on Jan 2, 2025 (366 days later). <strong>Profit: €0 tax</strong></div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">⚠</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Scenario 2: Short-Term Trade (28% Tax)</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">You buy 1 BTC on Jan 1, 2024. You sell on Nov 1, 2024 (305 days later). Profit: €10,000. <strong>Tax: €2,800 (28%)</strong></div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✗</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Scenario 3: Crypto-to-Crypto Swap (Resets Timer)</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">You buy ETH on Jan 1, 2024. You swap to SOL on June 1, 2024. <strong>Holding period resets to 0 days</strong> for the SOL</div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How This Affects Digital Nomads</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">For Long-Term Investors:</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-3 mb-6">
              <li><strong>Portugal is still a tax haven:</strong> 0% on holdings over 365 days makes it one of the best in Europe</li>
              <li><strong>Buy and hold strategy:</strong> Perfect for DCA investors who don't trade frequently</li>
              <li><strong>No wealth tax:</strong> Unlike some countries, Portugal doesn't tax unrealized gains</li>
              <li><strong>Quality of life:</strong> Low cost of living, great weather, strong expat community</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">For Active Traders:</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              If you trade frequently or provide liquidity on DeFi protocols, Portugal is less attractive:
            </p>
            <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Good For:</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Long-term HODLers (0% tax)</li>
                  <li>• Buy-and-hold investors</li>
                  <li>• Annual rebalancing (plan for 365+ days)</li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Less Ideal For:</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Day traders (28% on all gains)</li>
                  <li>• DeFi yield farmers (28% on rewards)</li>
                  <li>• Frequent crypto-to-crypto swaps</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Staking and DeFi Rewards</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              One area where Portugal is less favorable: <strong>passive crypto income is taxed at 28%</strong> regardless of holding period.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Taxable at 28%:</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• Staking rewards (ETH, SOL, ADA, etc.)</li>
                  <li>• Lending interest (Aave, Compound)</li>
                  <li>• Liquidity pool rewards</li>
                  <li>• Yield farming returns</li>
                  <li>• Airdrops (taxed at receipt)</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">2024 Reporting Requirements</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Since February 2024, Portugal requires <strong>annual crypto asset declarations</strong>. You must report:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>All crypto holdings (even if not sold)</li>
              <li>Exchange accounts and wallet addresses</li>
              <li>Total value as of December 31st each year</li>
              <li>Transactions during the tax year</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              This is <strong>informational reporting only</strong> — you're not taxed on unrealized gains, but the government wants visibility into crypto holdings.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Tax Optimization Strategies</h2>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3">How to Minimize Taxes in Portugal:</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1.</span>
                  <span><strong>Hold for 365+ days:</strong> Plan all sales to exceed the 1-year threshold</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">2.</span>
                  <span><strong>Avoid crypto-to-crypto swaps:</strong> Each swap resets your holding period to zero</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">3.</span>
                  <span><strong>Time your move:</strong> Become a tax resident before selling long-term holdings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">4.</span>
                  <span><strong>Track acquisition dates:</strong> Use HIFO method to sell oldest coins first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">5.</span>
                  <span><strong>Consider DeFi carefully:</strong> Rewards are taxed at 28%, so factor this into yield calculations</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Comparison with Other Countries</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              How does Portugal stack up against other popular destinations?
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇦🇪 UAE (Dubai)</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% (all holdings) | <strong>AI Score:</strong> 86/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  No distinction between short/long term. 0% on everything. But higher cost of living and $5,000/year visa costs.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇸🇬 Singapore</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% (if not trading professionally) | <strong>AI Score:</strong> 86/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Similar to Portugal's long-term approach. But definition of "professional trading" is subjective. Very high cost of living.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇩🇪 Germany</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% after 1 year | <strong>AI Score:</strong> 68/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Same 1-year rule as Portugal, but short-term gains taxed at 26-45% (vs Portugal's flat 28%). Higher overall taxes.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇨🇾 Cyprus</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% (long-term gains) | <strong>AI Score:</strong> 78/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  EU member like Portugal. Similar tax treatment. Lower cost of living but less developed infrastructure.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Portugal remains <strong>one of Europe's best countries for crypto holders</strong>, especially if you're a long-term investor. The 0% tax on holdings over 365 days is extremely competitive, and the quality of life is excellent.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              However, if you're an active trader or DeFi user, the 28% tax on short-term gains and staking rewards means you'll need to factor taxes into your strategy. For pure tax optimization, the UAE or Singapore might be better choices — but Portugal wins on lifestyle, cost of living, and ease of residency.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Bottom line:</strong> Portugal is ideal for buy-and-hold crypto investors who want excellent quality of life, EU access, and 0% long-term capital gains tax.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Compare Portugal with Other Countries</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Use our AI-powered tool to compare Portugal's proposed 28% crypto tax with 162 other countries.
              </p>
              <Link
                href="/countries"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                Explore 163 Countries
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
