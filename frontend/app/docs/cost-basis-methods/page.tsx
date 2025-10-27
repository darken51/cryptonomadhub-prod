'use client'

import Link from 'next/link'
import { ArrowLeft, Calculator } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function CostBasisMethodsDoc() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full mb-4">
              Tax Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              FIFO vs LIFO vs HIFO: Which to Choose?
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Compare cost basis methods and understand which one optimizes your tax situation.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>12 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is Cost Basis?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Cost basis</strong> is the original purchase price of an asset. When you sell crypto, the IRS requires you to calculate your capital gain or loss:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6 text-center">
              <code className="text-xl font-bold text-slate-900 dark:text-white">
                Capital Gain/Loss = Selling Price - Cost Basis
              </code>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The <strong>cost basis method</strong> you choose determines which specific units you're selling, which directly impacts your taxable gain or loss.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The Three IRS-Approved Methods</h2>

            <div className="grid gap-6 not-prose my-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">FIFO - First In, First Out</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>Sell the oldest coins first.</strong> The first crypto you bought is the first crypto you sell.
                </p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Example:</strong></p>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Jan 1: Buy 1 BTC at $40,000</li>
                    <li>• Mar 1: Buy 1 BTC at $50,000</li>
                    <li>• Jun 1: Sell 1 BTC at $60,000</li>
                    <li>• <strong className="text-blue-600 dark:text-blue-400">FIFO uses Jan purchase: $60,000 - $40,000 = $20,000 gain</strong></li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">LIFO - Last In, First Out</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>Sell the newest coins first.</strong> The last crypto you bought is the first crypto you sell.
                </p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Example (same scenario):</strong></p>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Jan 1: Buy 1 BTC at $40,000</li>
                    <li>• Mar 1: Buy 1 BTC at $50,000</li>
                    <li>• Jun 1: Sell 1 BTC at $60,000</li>
                    <li>• <strong className="text-rose-600 dark:text-rose-400">LIFO uses Mar purchase: $60,000 - $50,000 = $10,000 gain</strong></li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">HIFO - Highest In, First Out</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>Sell the highest-cost coins first.</strong> Choose the purchase with the highest cost to minimize gains.
                </p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Example (same scenario):</strong></p>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Jan 1: Buy 1 BTC at $40,000</li>
                    <li>• Mar 1: Buy 1 BTC at $50,000</li>
                    <li>• Jun 1: Sell 1 BTC at $60,000</li>
                    <li>• <strong className="text-emerald-600 dark:text-emerald-400">HIFO uses Mar purchase (highest): $60,000 - $50,000 = $10,000 gain</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Comparison</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Let's compare all three methods with a realistic scenario:
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Your ETH Purchases:</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>• Jan 15: Buy 10 ETH @ $2,000 = $20,000 cost</li>
                <li>• Mar 20: Buy 5 ETH @ $3,000 = $15,000 cost</li>
                <li>• Jul 10: Buy 8 ETH @ $1,800 = $14,400 cost</li>
                <li>• Oct 5: Buy 7 ETH @ $2,500 = $17,500 cost</li>
              </ul>
              <p className="font-bold text-slate-900 dark:text-white mt-4 mb-2">Today's Sale:</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">• Dec 1: Sell 12 ETH @ $2,800 = $33,600 revenue</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 not-prose my-8">
              <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">FIFO</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Uses oldest first:</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 mb-3">
                  <li>10 ETH @ $2,000 = $20,000</li>
                  <li>2 ETH @ $3,000 = $6,000</li>
                  <li><strong>Total cost: $26,000</strong></li>
                </ul>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Capital Gain:</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">$7,600</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-rose-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-3">LIFO</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Uses newest first:</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 mb-3">
                  <li>7 ETH @ $2,500 = $17,500</li>
                  <li>5 ETH @ $1,800 = $9,000</li>
                  <li><strong>Total cost: $26,500</strong></li>
                </ul>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Capital Gain:</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">$7,100</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">HIFO</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Uses highest first:</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 mb-3">
                  <li>5 ETH @ $3,000 = $15,000</li>
                  <li>7 ETH @ $2,500 = $17,500</li>
                  <li><strong>Total cost: $32,500</strong></li>
                </ul>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Capital Gain:</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$1,100</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">BEST</div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Tax Savings with HIFO:</p>
              <p className="text-slate-700 dark:text-slate-300">
                HIFO saves <strong>$6,500 in capital gains</strong> compared to FIFO. At a 20% tax rate, that's <strong>$1,300 in tax savings</strong> from choosing the right method!
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Which Method Should You Use?</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">✅ Use FIFO when:</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li>• You bought crypto during a bull market (prices went up)</li>
                  <li>• You want to maximize long-term capital gains (lower tax rate after 1 year)</li>
                  <li>• You prefer the default, simplest method</li>
                  <li>• You're a long-term holder selling your earliest positions</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-3">✅ Use LIFO when:</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li>• You recently bought during a dip</li>
                  <li>• You want to minimize short-term gains (if recent purchases are higher)</li>
                  <li>• Crypto prices have been generally declining</li>
                  <li>• You're actively trading and want to offset recent purchases</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">✅ Use HIFO when:</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li>• <strong>You want to minimize taxes (best for most traders)</strong></li>
                  <li>• You have purchases at various price points</li>
                  <li>• You're actively managing your tax strategy</li>
                  <li>• You want maximum flexibility and optimization</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">IRS Rules & Restrictions</h2>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-3">⚠️ Important IRS Requirements:</h3>
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 mt-1">1.</span>
                  <span><strong>Choose once per asset:</strong> You must use the same method for all sales of the same cryptocurrency (e.g., all ETH sales must use FIFO or HIFO, but you can use LIFO for BTC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 mt-1">2.</span>
                  <span><strong>Document everything:</strong> Keep records of all purchases with dates, prices, and amounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 mt-1">3.</span>
                  <span><strong>Be consistent:</strong> Once you choose a method for a specific crypto, you should stick with it (though you can technically change)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 mt-1">4.</span>
                  <span><strong>Specific identification required for HIFO:</strong> You must specifically identify which coins you're selling at the time of sale</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How CryptoNomadHub Handles Cost Basis</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our platform automatically calculates all three methods for you:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-3 mb-6">
              <li><strong>Automatic calculation:</strong> We calculate FIFO, LIFO, and HIFO for every transaction</li>
              <li><strong>Side-by-side comparison:</strong> See exactly how much tax you'll save with each method</li>
              <li><strong>One-click switching:</strong> Change methods and instantly see updated tax implications</li>
              <li><strong>Form 8949 export:</strong> Export IRS tax forms with your chosen method</li>
              <li><strong>Historical tracking:</strong> We remember your purchase dates and prices automatically</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Advanced Strategies</h2>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">💡 Pro Tip: Use HIFO with Tax Loss Harvesting</h3>
              <p className="text-slate-700 dark:text-slate-300">
                Combine HIFO with <Link href="/docs/wash-sale-detection" className="text-blue-600 dark:text-indigo-400 hover:underline">tax loss harvesting</Link> for maximum savings:
              </p>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mt-3">
                <li>Use HIFO to minimize gains on profitable sales</li>
                <li>Use FIFO to maximize losses on losing positions</li>
                <li>Offset gains with losses to reduce total tax liability</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Start Optimizing Your Cost Basis</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                See how much you can save by comparing all three methods on your portfolio.
              </p>
              <Link
                href="/cost-basis"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                <Calculator className="w-5 h-5" />
                Calculate Your Cost Basis
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
