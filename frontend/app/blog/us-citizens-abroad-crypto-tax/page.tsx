'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, DollarSign, Calendar, AlertCircle, Globe } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function USCitizensAbroadBlogPost() {
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
              Tax Planning
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              US Citizens Abroad: Crypto Tax Obligations Explained
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>June 5, 2025</span>
              </div>
              <span>13 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 mb-8 border-2 border-amber-200 dark:border-amber-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> US citizens living abroad must pay US taxes on worldwide crypto gains, file FBAR if foreign accounts exceed $10k, and potentially file FATCA Form 8938. Moving abroad doesn't eliminate US crypto tax obligations.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The Citizenship-Based Taxation Problem</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Unlike almost every other country, the United States uses <strong>citizenship-based taxation</strong>. This means:
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">You Can't Escape US Taxes By Moving</h3>
                  <ul className="space-y-2 text-red-800 dark:text-red-200 mb-0">
                    <li>• US citizens pay US taxes on <strong>worldwide income</strong> (including crypto)</li>
                    <li>• Even if you live in Dubai (0% tax), you still owe US taxes</li>
                    <li>• Only way out: <strong>renounce citizenship</strong> (costs $2,350 + exit tax)</li>
                    <li>• Green card holders also subject to US taxation</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Regular Crypto Tax Obligations</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              As a US citizen abroad, you have the same crypto tax obligations as someone living in the US:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Capital Gains Tax</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Long-term ({'>'}1 year):</strong> 0%, 15%, or 20% depending on income<br/>
                  <strong>Short-term ({'<'}1 year):</strong> 10%-37% (ordinary income rates)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Income Tax on Rewards</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Staking rewards, mining, airdrops taxed as ordinary income (10%-37%)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. Annual Filing (Form 1040)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Must answer "Yes" to crypto question on Form 1040. Report all gains/losses on Schedule D and Form 8949.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">FBAR: Foreign Bank Account Report</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">What is FBAR?</h3>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                <strong>FBAR (FinCEN Form 114)</strong> requires US citizens to report foreign financial accounts if the total value exceeds <strong>$10,000 at any point during the year</strong>.
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Does FBAR Apply to Crypto?</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Current Status (2025):</strong> Officially, the IRS says crypto is "property" not "financial accounts," so FBAR doesn't apply.
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
                  ⚠️ However, FinCEN Notice 2020-2 states they intend to require crypto FBAR reporting. Many tax professionals recommend filing FBAR for crypto anyway to be safe.
                </p>
              </div>

              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Penalty for Not Filing FBAR:</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• <strong>Willful violation:</strong> $100,000 or 50% of account value</li>
                  <li>• <strong>Non-willful violation:</strong> $10,000 per year</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">FBAR Threshold Examples</h3>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Scenario 1: FBAR Required</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      You have €8,000 in a German bank + $3,000 in Binance (foreign exchange). Total: $11,000+ = <strong>FBAR required</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">✗</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Scenario 2: FBAR Not Required</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      You have $8,000 in Binance. Never exceeds $10k = <strong>No FBAR</strong> (but still report gains on 1040)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">?</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Scenario 3: Wallet (Unclear)</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      You have $50,000 in MetaMask (self-custody). Not on foreign exchange = <strong>Unclear if FBAR applies</strong> (consult CPA)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">FATCA: Form 8938</h2>

            <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-violet-900 dark:text-violet-300 mb-3">What is FATCA?</h3>
              <p className="text-violet-800 dark:text-violet-200 mb-3">
                <strong>FATCA (Foreign Account Tax Compliance Act)</strong> requires reporting of foreign financial assets on <strong>Form 8938</strong> if you exceed certain thresholds.
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Thresholds for US Citizens Living Abroad:</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div>
                    <strong>Single or Married Filing Separately:</strong><br/>
                    • $200,000 on last day of year, OR<br/>
                    • $300,000 at any time during year
                  </div>
                  <div>
                    <strong>Married Filing Jointly:</strong><br/>
                    • $400,000 on last day of year, OR<br/>
                    • $600,000 at any time during year
                  </div>
                </div>
              </div>

              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Penalty for Not Filing Form 8938:</h4>
                <p className="text-sm text-red-800 dark:text-red-200">
                  $10,000 penalty, plus additional $10,000 for each 30 days of continued failure (up to $60,000 total)
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">FBAR vs FATCA: Key Differences</h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">Aspect</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">FBAR (FinCEN 114)</th>
                    <th className="border border-slate-300 dark:border-slate-600 p-3 text-left">FATCA (Form 8938)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">Threshold</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">$10,000</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">$200k-$600k (depends on filing status)</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">Filed With</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">FinCEN (separate filing)</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">IRS (with Form 1040)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">Deadline</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">April 15 (auto-extend to Oct 15)</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">April 15 (extends with 1040)</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">Crypto Status</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">Unclear (FinCEN says will require)</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">Unclear (no official guidance)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold">Max Penalty</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">$100,000 or 50% of account</td>
                    <td className="border border-slate-300 dark:border-slate-600 p-3">$60,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Foreign Earned Income Exclusion (FEIE)</h2>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">One Silver Lining: FEIE</h3>
                  <p className="text-emerald-800 dark:text-emerald-200 mb-3">
                    <strong>Form 2555 (Foreign Earned Income Exclusion)</strong> allows you to exclude up to <strong>$126,500</strong> (2025) of foreign earned income from US taxation.
                  </p>
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                    <p className="text-sm text-red-900 dark:text-red-200 font-semibold">
                      ⚠️ <strong>IMPORTANT:</strong> FEIE does NOT apply to crypto gains. Only applies to "earned income" like salary or freelance work. Crypto is capital gains (investment income), not earned income.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">2025 New Reporting: Form 1099-DA</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Starting in 2025, US-based crypto exchanges will send <strong>Form 1099-DA</strong> to the IRS and to you, reporting all digital asset transactions.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800 mb-8">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>What this means for expats:</strong>
              </p>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>• If you use Coinbase, Kraken, Gemini (US exchanges), they'll report everything to IRS</li>
                <li>• Foreign exchanges (Binance, Bybit) may not report to IRS</li>
                <li>• You must still self-report ALL transactions, regardless of 1099 forms</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Compliance Checklist for US Citizens Abroad</h2>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 my-8 border-2 border-slate-300 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Required Annual Filings:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" disabled />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Form 1040:</strong> US tax return with crypto question answered
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" disabled />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Schedule D + Form 8949:</strong> Report all crypto capital gains/losses
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" disabled />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>FBAR (FinCEN 114):</strong> If foreign accounts {'>'} $10k (consider including crypto exchanges)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" disabled />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Form 8938 (FATCA):</strong> If foreign assets exceed thresholds ($200k-$600k depending on status)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 w-5 h-5" disabled />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Form 2555 (FEIE):</strong> Exclude foreign earned income (NOT crypto gains)
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Should You Renounce US Citizenship?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              For high-net-worth crypto holders, renouncing US citizenship may be worth considering. However, it's complex and expensive:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Pros</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>✓ No more US taxes on future gains</li>
                  <li>✓ No FBAR/FATCA reporting</li>
                  <li>✓ Move to 0% tax countries (UAE, Portugal)</li>
                  <li>✓ Simplify global tax situation</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Cons</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>✗ $2,350 renunciation fee</li>
                  <li>✗ Exit tax on unrealized gains {'>'}$866k</li>
                  <li>✗ Lose US passport/travel benefits</li>
                  <li>✗ Difficult to visit US long-term</li>
                  <li>✗ Irreversible decision</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Being a US citizen with crypto is challenging. You're subject to US taxation no matter where you live, and compliance requirements (FBAR, FATCA) add complexity and risk of severe penalties.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Key takeaways:</strong>
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>You must file US taxes and report crypto gains even if you live abroad</li>
              <li>FBAR and FATCA may apply to your crypto holdings (consult a CPA)</li>
              <li>Moving to a 0% crypto tax country doesn't help US citizens (you still owe US taxes)</li>
              <li>FEIE doesn't apply to crypto (only earned income)</li>
              <li>Penalties for non-compliance are severe ($100k+)</li>
              <li>Consider professional help — international crypto tax is complex</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Always consult with a qualified CPA or tax attorney</strong> who specializes in expat crypto taxation before making any decisions.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatic US Expat Tax Compliance</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub automatically generates Form 8949, identifies FBAR/FATCA obligations, and tracks your crypto taxes across all countries.
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
