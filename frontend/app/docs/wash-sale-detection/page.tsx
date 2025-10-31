'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Shield } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'

export default function WashSaleDoc() {
  return (
    <PublicPageSSR>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded-full mb-4">
              Tax Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Wash Sale Detection Explained
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Understand the 30-day wash sale rule and how our AI detects violations automatically.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>7 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is a Wash Sale?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              A <strong>wash sale</strong> occurs when you sell an asset at a loss and then buy the same (or "substantially identical") asset within <strong>30 days before or after</strong> the sale.
            </p>

            <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-rose-900 dark:text-rose-300 mb-2">Why It Matters</h3>
                  <p className="text-rose-800 dark:text-rose-200">
                    If you trigger a wash sale, the <strong>IRS disallows the loss deduction</strong>. You can't use that loss to offset capital gains for tax purposes.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The 30-Day Rule</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              The wash sale window is <strong>61 days total</strong>:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6 text-center">
              <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">Wash Sale Window</div>
              <code className="text-2xl font-bold text-slate-900 dark:text-white">
                30 days BEFORE + Sale Day + 30 days AFTER
              </code>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Example</h2>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">❌ Wash Sale Violation</h3>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold">Jan 1: Buy 1 BTC @ $50,000</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Initial purchase</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold">Feb 10: Sell 1 BTC @ $35,000</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Loss of $15,000 (for tax deduction)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold">Feb 20: Buy 1 BTC @ $37,000</div>
                    <div className="text-sm text-red-600 dark:text-red-400 font-semibold">⚠️ WASH SALE! Bought within 30 days</div>
                  </div>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mt-4">
                <p className="text-red-900 dark:text-red-300 font-semibold">Result:</p>
                <p className="text-red-800 dark:text-red-200">
                  Your $15,000 loss is <strong>disallowed</strong>. You cannot deduct it from your taxes this year. The loss is added to the cost basis of the new purchase instead.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800 mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">✅ No Wash Sale</h3>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold">Jan 1: Buy 1 BTC @ $50,000</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Initial purchase</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold">Feb 10: Sell 1 BTC @ $35,000</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Loss of $15,000</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold">Mar 20: Buy 1 BTC @ $40,000</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">✅ No wash sale! 38 days later ({'>'}30 days)</div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-4 mt-4">
                <p className="text-emerald-900 dark:text-emerald-300 font-semibold">Result:</p>
                <p className="text-emerald-800 dark:text-emerald-200">
                  Your $15,000 loss is <strong>allowed</strong>. You can use it to offset capital gains and reduce your taxes this year!
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Does Wash Sale Apply to Crypto?</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">⚖️ Current Legal Status (2025)</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                The IRS wash sale rule <strong>officially applies to stocks and securities</strong>. Cryptocurrency is classified as <strong>property</strong>, not a security.
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                <strong>As of 2025, the wash sale rule does NOT technically apply to crypto.</strong> However:
              </p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• Congress has proposed legislation to extend wash sale rules to crypto</li>
                <li>• It may become law in future tax years</li>
                <li>• The IRS may reinterpret existing rules to cover crypto</li>
                <li>• Some tax professionals recommend treating crypto wash sales conservatively</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How CryptoNomadHub Tracks Wash Sales</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Even though wash sales don't officially apply to crypto yet, we <strong>track them proactively</strong> to help you:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-3 mb-6">
              <li><strong>Prepare for future legislation:</strong> If wash sale rules extend to crypto, you'll already be compliant</li>
              <li><strong>Avoid IRS scrutiny:</strong> Conservative tax reporting reduces audit risk</li>
              <li><strong>Make informed decisions:</strong> Know which losses are "safe" vs potentially disallowed</li>
              <li><strong>Optimize timing:</strong> Get alerts when 31 days have passed and losses become fully deductible</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Automatic Detection</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our AI automatically detects potential wash sales:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Scans All Transactions</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Analyzes every buy and sell across all connected wallets and chains
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Identifies Loss Sales</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Finds transactions where you sold crypto at a loss
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Checks 61-Day Window</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Looks for purchases of the same crypto 30 days before or after the loss sale
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Flags Violations</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Highlights potential wash sales with warnings and explanations
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Adjusts Cost Basis</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Automatically adds disallowed loss to the new purchase's cost basis (if applicable)
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Avoid Wash Sales</h2>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3">✅ Safe Strategies</h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Wait 31 days:</strong> After selling at a loss, wait 31 days before buying again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Buy different crypto:</strong> Sell BTC at a loss, buy ETH instead (not "substantially identical")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Tax loss harvest strategically:</strong> Sell losers at year-end, wait until new year to rebuy</span>
                  </li>
                </ul>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-800">
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-300 mb-3">❌ Risky Actions</h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span><strong>Immediate rebuy:</strong> Selling and buying the same crypto the same day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span><strong>DCA during losses:</strong> Dollar-cost averaging while also selling at losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span><strong>Ignoring the rule:</strong> Not tracking wash sales even if not required</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Wash Sale Alerts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              CryptoNomadHub provides real-time wash sale alerts:
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 border-l-4 border-amber-500">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-amber-900 dark:text-amber-300">Wash Sale Warning</span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    You sold 0.5 BTC at a loss on Feb 10. Buying BTC before Mar 13 will trigger a wash sale.
                  </p>
                </div>

                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-4 border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">Safe to Buy</span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    31 days have passed since your last BTC loss sale. You can now buy BTC without wash sale risk.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">FAQ</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Q: Is BTC and ETH "substantially identical"?</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>A:</strong> No. Bitcoin and Ethereum are different cryptocurrencies. Selling BTC at a loss and buying ETH does NOT trigger a wash sale.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Q: What if I use different wallets?</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>A:</strong> Wash sale rules apply across ALL accounts and wallets you control. Selling in one wallet and buying in another still counts.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Q: Can I claim losses from wash sales later?</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>A:</strong> Yes! The disallowed loss is added to the cost basis of your repurchase. You'll realize the loss when you eventually sell that position.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Track Wash Sales Automatically</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Let our AI monitor your transactions and alert you before you trigger wash sales.
              </p>
              <Link
                href="/tax-optimizer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
              >
                View Wash Sale Report
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageSSR>
  )
}
