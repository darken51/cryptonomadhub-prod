'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function WashSaleRuleBlogPost() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-semibold rounded-full mb-4">
              Tax Strategy
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Wash Sale Rule for Crypto: What You Need to Know
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>June 20, 2025</span>
              </div>
              <span>9 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-8 mb-8 border-2 border-rose-200 dark:border-rose-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> The wash sale rule currently does NOT apply to cryptocurrency in the US as of 2025. You can sell crypto at a loss and rebuy immediately for tax harvesting. However, proposed legislation may change this soon.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is the Wash Sale Rule?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The <strong>wash sale rule</strong> is an IRS regulation that prevents taxpayers from claiming a capital loss on a security if they buy the same or "substantially identical" security within <strong>30 days before or after</strong> the sale.
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">The 61-Day Window</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                The wash sale window is actually <strong>61 days total</strong>:
              </p>
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-700 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-bold">30 days BEFORE</div>
                    <div className="text-xs">No buying</div>
                  </div>
                  <div className="text-2xl">+</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <div className="font-bold">SALE DAY</div>
                  </div>
                  <div className="text-2xl">+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div className="font-bold">30 days AFTER</div>
                    <div className="text-xs">No buying</div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Current Status for Crypto (2025)</h2>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Good News: Wash Sale Rule Does NOT Apply to Crypto</h3>
                  <p className="text-emerald-800 dark:text-emerald-200 mb-3">
                    As of 2025, the IRS classifies cryptocurrency as <strong>property</strong>, not securities. Therefore, the wash sale rule does not apply.
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-200 mb-0">
                    This means you can sell Bitcoin at a loss today and buy it back immediately — the loss is still deductible.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Example: Tax Loss Harvesting Without Wash Sales</h2>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Scenario: Sarah's Tax Harvesting Strategy</h4>

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span><strong>March 1:</strong> Buys 1 BTC at $60,000</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>December 20:</strong> BTC drops to $50,000</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span><strong>December 20 (10am):</strong> Sells 1 BTC at $50,000</span>
                  <span className="font-bold">Loss: -$10,000</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span><strong>December 20 (2pm):</strong> Buys back 1 BTC at $50,100</span>
                  <span className="font-bold">Same day!</span>
                </div>
              </div>

              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-4 border border-emerald-300 dark:border-emerald-700">
                <div className="text-sm text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold mb-2">Result (For Crypto):</div>
                  <ul className="space-y-1">
                    <li>✓ Sarah can deduct the <strong>$10,000 loss</strong> on her taxes</li>
                    <li>✓ She still owns 1 BTC (same position)</li>
                    <li>✓ Tax savings: $10,000 × 20% = <strong>$2,000</strong></li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border border-red-300 dark:border-red-700 mt-4">
                <div className="text-sm text-red-900 dark:text-red-200">
                  <div className="font-bold mb-2">If This Were Stocks (Wash Sale Applies):</div>
                  <ul className="space-y-1">
                    <li>✗ Loss would be <strong>disallowed</strong></li>
                    <li>✗ Must wait 31 days to rebuy without triggering wash sale</li>
                    <li>✗ Misses out on potential gains during 31-day wait</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Proposed Legislation Warning</h2>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">This May Change Soon</h3>
                  <p className="text-amber-800 dark:text-amber-200 mb-3">
                    The Biden Administration's 2025 fiscal budget proposal includes extending wash sale rules to cryptocurrency. While this hasn't passed into law yet, it's been proposed multiple times.
                  </p>
                  <p className="text-amber-800 dark:text-amber-200 mb-0">
                    If passed, crypto would be treated like stocks, and the 30-day rule would apply to tax loss harvesting.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Strategies: With vs Without Wash Sales</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Current Strategy (No Wash Sales)
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>✓ Sell and rebuy <strong>immediately</strong></li>
                  <li>✓ Harvest losses in December</li>
                  <li>✓ Keep same crypto position</li>
                  <li>✓ No waiting period needed</li>
                  <li>✓ Maximum tax savings</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Future Strategy (If Wash Sales Apply)
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>⏳ Wait <strong>31+ days</strong> before rebuying</li>
                  <li>⚠️ Risk missing price recovery</li>
                  <li>🔄 Buy "similar but not identical" asset temporarily</li>
                  <li>📊 More complex tracking required</li>
                  <li>💰 Potentially lower tax savings</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Workaround: Swap to Similar Assets</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              If wash sale rules do eventually apply to crypto, you could use this workaround:
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Example Workaround Strategy:</h4>

              <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Sell BTC at a loss to harvest the tax benefit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Immediately buy ETH (different asset, so not "substantially identical")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Wait 31 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Swap ETH back to BTC</span>
                </li>
              </ol>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">
                <strong>Note:</strong> This maintains crypto exposure while potentially avoiding wash sale disallowance. However, you're exposed to BTC/ETH price divergence during the 31 days.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Mistakes to Avoid</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Assuming wash sales apply to crypto NOW</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  They don't (as of 2025). You're leaving money on the table by waiting 30 days when you don't need to.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Ignoring proposed legislation</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Stay informed. If wash sale rules pass for crypto, adjust your strategy immediately. The change would likely apply to transactions after the law's effective date.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Not documenting transactions properly</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Whether wash sales apply or not, you need detailed records of every buy and sell, including dates, amounts, prices, and platforms.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">❌ Harvesting losses without offsetting gains</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Losses only save taxes if you have gains to offset (or limited ordinary income). Don't harvest losses unnecessarily.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">International Considerations</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Wash sale rules vary by country:
            </p>

            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>United States:</strong> Wash sales don't apply to crypto yet, but may soon</li>
              <li><strong>United Kingdom:</strong> Has a 30-day "bed and breakfast" rule that applies to crypto</li>
              <li><strong>Canada:</strong> Has "superficial loss" rules that may apply to crypto</li>
              <li><strong>Germany:</strong> No wash sale rule, but has the 1-year holding requirement</li>
              <li><strong>Australia:</strong> No specific wash sale rule for crypto</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Tax Loss Harvesting Automation</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Manually tracking opportunities for tax loss harvesting is complex. Consider using tools that:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Automated Detection</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Identify which assets are in a loss position and calculate potential tax savings
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Compliance Tracking</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Monitor if/when wash sale rules apply and alert you to compliance requirements
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The absence of wash sale rules for crypto (as of 2025) provides a <strong>significant tax advantage</strong> compared to traditional securities. You can harvest losses aggressively in December and rebuy immediately, saving thousands in taxes while maintaining your crypto positions.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              However, this advantage may not last forever. Proposed legislation could extend wash sale rules to crypto at any time. <strong>Take advantage now while you can</strong>, but stay informed about regulatory changes.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Important:</strong> This article is for educational purposes. Always consult with a qualified tax professional before implementing any tax strategy.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatic Tax Loss Harvesting Detection</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub automatically identifies loss harvesting opportunities and tracks whether wash sale rules apply in your jurisdiction.
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
