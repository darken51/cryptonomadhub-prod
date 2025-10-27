'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, TrendingDown } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function TaxLossHarvestingBlogPost() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold rounded-full mb-4">
              Tax Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Tax Loss Harvesting: Ultimate Guide for Crypto Traders
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>September 20, 2025</span>
              </div>
              <span>15 min read</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-8">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                💡 Key Takeaway
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-0">
                Tax loss harvesting can reduce your crypto tax bill by <strong>20-37%</strong> by strategically selling losing positions to offset gains. Learn how to do it legally and maximize savings.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is Tax Loss Harvesting?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Tax loss harvesting</strong> is the strategy of intentionally selling crypto assets at a loss to <strong>offset capital gains</strong> from profitable trades, reducing your overall tax liability.
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Simple Example:</p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• You made <strong>$50,000 profit</strong> from selling Bitcoin</li>
                <li>• You have Ethereum that's down <strong>$15,000</strong></li>
                <li>• Sell the Ethereum to "realize" the loss</li>
                <li>• Taxable gain: $50,000 - $15,000 = <strong>$35,000</strong></li>
                <li>• Tax savings (at 20% rate): <strong>$3,000</strong></li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Why It Works for Crypto</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Unlike stocks, cryptocurrency <strong>is not subject to the wash sale rule</strong> (as of 2025). This means you can:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>Sell crypto at a loss</li>
              <li><strong>Immediately buy it back</strong> (same day or next day)</li>
              <li>Claim the loss on your taxes</li>
              <li>Maintain your position in the asset</li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <p className="text-amber-900 dark:text-amber-300 font-semibold mb-2">⚠️ Important Note:</p>
              <p className="text-amber-800 dark:text-amber-200 mb-0">
                Congress has proposed extending wash sale rules to crypto. This loophole may close in 2026 or later. Take advantage while it's still legal!
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step-by-Step: How to Tax Loss Harvest</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Identify Losing Positions</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  Review your portfolio and find assets currently worth <strong>less than you paid</strong> for them.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Example:</strong></p>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Bought ETH at $3,500 → Now $2,200 = <span className="text-red-600 font-bold">$1,300 loss</span></li>
                    <li>• Bought SOL at $150 → Now $95 = <span className="text-red-600 font-bold">$55 loss</span></li>
                    <li>• Bought MATIC at $1.20 → Now $0.70 = <span className="text-red-600 font-bold">$0.50 loss</span></li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Calculate Total Losses</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Add up all your unrealized losses. This is your <strong>maximum harvestable amount</strong> for the year.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-violet-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Compare to Your Gains</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  Check how much profit you made this year from crypto sales. Your strategy depends on this:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• <strong>High gains ($50K+):</strong> Harvest losses to offset as much as possible</li>
                  <li>• <strong>Low gains ($10K or less):</strong> Harvest only what you need</li>
                  <li>• <strong>Net losses this year:</strong> Can carry forward up to $3,000/year against regular income</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-rose-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Execute the Sales</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  Sell your losing positions. <strong>Keep records:</strong>
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Date and time of sale</li>
                  <li>• Amount sold</li>
                  <li>• Sale price</li>
                  <li>• Original purchase price (cost basis)</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-amber-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Buy Back (Optional)</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  If you still believe in the asset, <strong>buy it back immediately</strong>. Since wash sale rules don't apply to crypto (yet), you can rebuy the same day and still claim the loss.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Example</h2>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 my-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Scenario: Sarah's 2024 Crypto Taxes</h3>

              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">Sarah's Gains:</p>
                  <ul className="text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Sold BTC in March: <span className="text-emerald-600 font-bold">+$45,000 profit</span></li>
                    <li>• Sold AVAX in July: <span className="text-emerald-600 font-bold">+$8,500 profit</span></li>
                    <li>• <strong>Total gains: $53,500</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">Sarah's Losing Positions (December):</p>
                  <ul className="text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• ETH: Down <span className="text-rose-600 font-bold">$12,000</span></li>
                    <li>• SOL: Down <span className="text-rose-600 font-bold">$6,500</span></li>
                    <li>• MATIC: Down <span className="text-rose-600 font-bold">$3,200</span></li>
                    <li>• <strong>Total losses: $21,700</strong></li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-lg p-6">
                  <p className="font-semibold text-slate-900 dark:text-white mb-3">Tax Impact:</p>
                  <div className="space-y-2 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span><strong>Without</strong> tax loss harvesting:</span>
                      <span></span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>Taxable gains:</span>
                      <span>$53,500</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>Tax (20% long-term rate):</span>
                      <span className="text-rose-600 font-bold">$10,700</span>
                    </div>

                    <div className="border-t border-slate-300 dark:border-slate-600 my-3"></div>

                    <div className="flex justify-between">
                      <span><strong>With</strong> tax loss harvesting:</span>
                      <span></span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>Taxable gains:</span>
                      <span>$53,500 - $21,700 = $31,800</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>Tax (20% rate):</span>
                      <span className="text-emerald-600 font-bold">$6,360</span>
                    </div>

                    <div className="border-t-2 border-emerald-500 mt-4 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">Tax Savings:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">$4,340</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-blue-900 dark:text-blue-300 font-semibold mb-2">What Sarah Did:</p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    She sold ETH, SOL, and MATIC on December 20th to realize the losses. Then on December 21st, she bought back the same amounts at similar prices because she still believed in these projects long-term. Result: <strong>$4,340 saved, same portfolio.</strong>
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Advanced Strategies</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Selective Harvesting</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Don't sell <strong>all</strong> your losing positions. Only harvest enough losses to offset your gains:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>If you have $30K gains, harvest $30K in losses</li>
              <li>Save remaining losses for future years</li>
              <li>Avoid unnecessary transaction fees</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Long-Term vs Short-Term Gains</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Prioritize offsetting <strong>short-term gains</strong> (taxed up to 37%) over long-term gains (taxed at 0-20%):
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>Example:</strong></p>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <li>• $20K short-term gains (held &lt;1 year) = $7,400 tax (37% rate)</li>
                <li>• $20K long-term gains (held &gt;1 year) = $4,000 tax (20% rate)</li>
                <li>• <strong>Use losses to offset short-term first!</strong></li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Year-End Timing</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Best time to harvest:</strong> December (before year-end). But you can harvest losses anytime during the year to offset gains as they happen.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Carry Forward Losses</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              If losses exceed gains, you can:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>Deduct up to <strong>$3,000/year</strong> against regular income (salary, etc.)</li>
              <li>Carry forward remaining losses to future years (indefinitely)</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Mistakes to Avoid</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Not Keeping Records</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Track every sale: date, amount, price, and cost basis. You'll need this for Form 8949.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Waiting Too Long</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Don't wait until December 31st. Exchanges can be slow, and you might miss the deadline.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Selling Winners to Offset Losses</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  You harvest <strong>losses</strong> to offset <strong>gains</strong>, not the other way around!
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Forgetting About Fees</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Selling and rebuying costs money (exchange fees, gas fees). Make sure tax savings &gt; transaction costs.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Is Tax Loss Harvesting Legal?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Yes, 100% legal.</strong> The IRS explicitly allows tax loss harvesting. It's a standard tax planning strategy used by investors worldwide.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>For crypto specifically:</strong> Since wash sale rules don't currently apply to cryptocurrency (unlike stocks), you can even buy back the same asset immediately. This may change in future legislation, so take advantage while you can.
            </p>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automate Tax Loss Harvesting</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub's Tax Optimizer identifies loss harvesting opportunities automatically and calculates potential savings.
              </p>
              <Link
                href="/tax-optimizer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                Find Opportunities
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
