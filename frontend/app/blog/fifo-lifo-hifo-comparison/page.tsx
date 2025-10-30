'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function FIFOLIFOHIFOBlogPost() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-semibold rounded-full mb-4">
              Tax Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              FIFO vs LIFO vs HIFO: Which Saves the Most Tax?
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>July 20, 2025</span>
              </div>
              <span>14 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-8 border-2 border-cyan-200 dark:border-cyan-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> The cost basis method you choose can save (or cost) you thousands in crypto taxes. HIFO typically saves the most by selling coins with the highest purchase price first, while FIFO is the IRS default. We'll show real examples with exact numbers.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is Cost Basis?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Cost basis</strong> is the original purchase price of an asset. When you sell crypto, your capital gain (or loss) is calculated as:
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <p className="text-center text-lg font-bold text-slate-900 dark:text-white mb-0">
                Capital Gain = Sale Price - Cost Basis
              </p>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              But what if you bought the same cryptocurrency multiple times at different prices? <strong>Which purchase do you count as "sold"?</strong> That's where cost basis methods come in.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The Three Main Methods</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. FIFO (First In, First Out)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  Sell your <strong>oldest coins first</strong>. The coins you bought earliest are assumed to be sold first.
                </p>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>IRS Default:</strong> If you don't specify a method, the IRS assumes FIFO.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. LIFO (Last In, First Out)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  Sell your <strong>newest coins first</strong>. The coins you bought most recently are assumed to be sold first.
                </p>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Less Common:</strong> Rarely optimal for crypto but useful in specific scenarios.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. HIFO (Highest In, First Out)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  Sell your <strong>most expensive coins first</strong>. The coins with the highest purchase price are sold first.
                </p>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <strong>Usually Best:</strong> Minimizes capital gains by maximizing cost basis.
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real Example: Same Sales, Different Taxes</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Let's use a realistic scenario to show how much each method can save you.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Scenario: Sarah's ETH Purchases</h4>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
                <div className="grid grid-cols-3 gap-4 font-semibold border-b border-slate-300 dark:border-slate-600 pb-2">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Price/ETH</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>Jan 2024</div>
                  <div>5 ETH</div>
                  <div>$2,000</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>Apr 2024</div>
                  <div>3 ETH</div>
                  <div>$3,000</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>Jul 2024</div>
                  <div>4 ETH</div>
                  <div>$2,500</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-300 dark:border-slate-600 pt-2 font-semibold">
                  <div>Total</div>
                  <div>12 ETH</div>
                  <div>Avg: $2,417</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
                In December 2024, Sarah sells <strong>8 ETH at $3,500 each</strong> = $28,000 total
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Method 1: FIFO (First In, First Out)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Sells the oldest coins first: 5 ETH from January + 3 ETH from April
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Sale proceeds (8 ETH × $3,500):</span>
                  <span className="font-bold">$28,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost basis (5 ETH × $2,000 + 3 ETH × $3,000):</span>
                  <span className="font-bold">$19,000</span>
                </div>
                <div className="flex justify-between border-t-2 border-blue-300 dark:border-blue-700 pt-2 mt-2">
                  <span className="font-bold">Capital Gain:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">$9,000</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span className="font-semibold">Tax (20% long-term):</span>
                  <span className="font-bold text-lg">$1,800</span>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Method 2: LIFO (Last In, First Out)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Sells the newest coins first: 4 ETH from July + 3 ETH from April + 1 ETH from January
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-6 border-2 border-amber-200 dark:border-amber-800">
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Sale proceeds (8 ETH × $3,500):</span>
                  <span className="font-bold">$28,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost basis (4×$2,500 + 3×$3,000 + 1×$2,000):</span>
                  <span className="font-bold">$21,000</span>
                </div>
                <div className="flex justify-between border-t-2 border-amber-300 dark:border-amber-700 pt-2 mt-2">
                  <span className="font-bold">Capital Gain:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">$7,000</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span className="font-semibold">Tax (20% long-term):</span>
                  <span className="font-bold text-lg">$1,400</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
                💰 Saves $400 vs FIFO
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">Method 3: HIFO (Highest In, First Out)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Sells the most expensive coins first: 3 ETH from April ($3,000) + 4 ETH from July ($2,500) + 1 ETH from January ($2,000)
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mb-6 border-2 border-emerald-200 dark:border-emerald-800">
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Sale proceeds (8 ETH × $3,500):</span>
                  <span className="font-bold">$28,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost basis (3×$3,000 + 4×$2,500 + 1×$2,000):</span>
                  <span className="font-bold">$21,000</span>
                </div>
                <div className="flex justify-between border-t-2 border-emerald-300 dark:border-emerald-700 pt-2 mt-2">
                  <span className="font-bold">Capital Gain:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">$7,000</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span className="font-semibold">Tax (20% long-term):</span>
                  <span className="font-bold text-lg">$1,400</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
                💰 Saves $400 vs FIFO (same as LIFO in this case)
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Side-by-Side Comparison</h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Method</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-right">Cost Basis</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-right">Capital Gain</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-right">Tax (20%)</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-right">Savings</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">FIFO</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$19,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$9,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right text-red-600 font-bold">$1,800</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">—</td>
                  </tr>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">LIFO</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$21,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$7,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right text-red-600 font-bold">$1,400</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right text-emerald-600 font-semibold">+$400</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">HIFO</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$21,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right">$7,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right text-red-600 font-bold">$1,400</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 text-right text-emerald-600 font-semibold">+$400</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">When Each Method is Best</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Best for FIFO
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>• <strong>Rising market:</strong> If you bought low early and price keeps rising, FIFO gives you the lowest cost basis</li>
                  <li>• <strong>Simplicity:</strong> IRS default method, requires no special tracking</li>
                  <li>• <strong>Long-term holdings:</strong> Automatically qualifies old coins for long-term capital gains rates</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                  Best for LIFO
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>• <strong>Falling market:</strong> If prices are dropping, newest purchases have higher cost basis</li>
                  <li>• <strong>Short holding periods acceptable:</strong> When you don't need long-term status</li>
                  <li>• <strong>Frequent buying in downtrends:</strong> You keep buying the dip, then prices rally slightly</li>
                </ul>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Best for HIFO (Most Common Winner)
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <li>• <strong>Volatile markets:</strong> You bought at various prices including some peaks</li>
                  <li>• <strong>DCA strategy:</strong> Dollar-cost averaging creates lots of different cost bases</li>
                  <li>• <strong>Tax minimization:</strong> Pure optimization — always sells highest cost first</li>
                  <li>• <strong>Flexible timing:</strong> Works regardless of market direction</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Use HIFO (Specific Identification)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              To use HIFO (or any method other than FIFO), you must use <strong>Specific Identification</strong>. The IRS allows this, but requires:
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-3">IRS Requirements for Specific Identification:</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">1.</span>
                  <span><strong>Identify at time of sale:</strong> You must specify which coins you're selling at the time of the transaction (not later when filing taxes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">2.</span>
                  <span><strong>Keep detailed records:</strong> Document purchase date, amount, price, and wallet/exchange for each acquisition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">3.</span>
                  <span><strong>Receive confirmation:</strong> Get written confirmation from the exchange/broker of which specific coins were sold</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">4.</span>
                  <span><strong>Be consistent:</strong> Once you use specific identification, continue using it for that same asset</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Tools That Track Cost Basis</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Manual tracking is nearly impossible with hundreds of transactions. Use crypto tax software:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">CryptoNomadHub</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Automatic FIFO, LIFO, HIFO calculation. Supports 50+ chains including Solana, Ethereum, Polygon.
                </p>
                <Link href="/auth/register" className="text-violet-600 dark:text-purple-400 text-sm font-semibold hover:underline">
                  Try Free →
                </Link>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Other Options</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Koinly, CoinTracker, CoinLedger, TokenTax, and others also support all three methods.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Mistakes to Avoid</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Switching methods mid-year</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  You can't use FIFO for some sales and HIFO for others within the same tax year for the same coin. Pick one method and stick with it.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Not documenting at time of sale</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  If you use HIFO, you must identify the specific coins at the time of sale. You can't retroactively choose later when filing taxes.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Ignoring wash sales (if applicable)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Currently wash sales don't apply to crypto in most countries, but this may change. If they do apply, your cost basis calculations become more complex.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Forgetting about gas fees</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Transaction fees can be added to your cost basis, reducing taxable gains. Don't forget to include them.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              For most crypto investors, <strong>HIFO is the best choice</strong> because it minimizes capital gains by maximizing cost basis. However, it requires:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>Detailed record-keeping of every purchase</li>
              <li>Identifying specific coins at time of sale</li>
              <li>Using software to track everything accurately</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              If you don't specify a method, the IRS defaults to FIFO, which often results in higher taxes. By proactively choosing HIFO and properly documenting it, you can save hundreds or thousands in taxes every year.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Always consult a tax professional</strong> before implementing any tax strategy. Rules vary by country, and mistakes can be costly.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatically Calculate Cost Basis with All Methods</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub automatically calculates your gains using FIFO, LIFO, and HIFO, then shows you which method saves the most tax.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
