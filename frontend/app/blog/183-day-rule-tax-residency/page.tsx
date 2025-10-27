'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Globe, AlertTriangle } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function Day183RuleBlogPost() {
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
              Tax Planning
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              The 183-Day Rule: Avoiding Accidental Tax Residency
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>August 20, 2025</span>
              </div>
              <span>7 min read</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-rose-900 dark:text-rose-300 mb-2">
                    Critical Warning for Perpetual Travelers
                  </p>
                  <p className="text-rose-800 dark:text-rose-200 mb-0">
                    Spending 183+ days in a country can trigger <strong>tax residency</strong>, subjecting you to that country's income and crypto taxes—even if you didn't intend to become a resident. Here's how to track and avoid it.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is the 183-Day Rule?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The <strong>183-day rule</strong> is a common standard used by most countries to determine <strong>tax residency</strong>. If you spend <strong>183 days or more</strong> in a country during a calendar year (or 12-month period), you typically become a tax resident of that country.
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Why 183 Days?</p>
              <p className="text-slate-700 dark:text-slate-300">
                183 days = <strong>half the year (365 ÷ 2 = 182.5)</strong>. Countries use this as a threshold to determine where your "center of life" is located. If you're physically present for more than half the year, you're considered a resident for tax purposes.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What Happens When You Trigger Tax Residency?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Once you become a tax resident, you're subject to that country's tax laws:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>Income tax</strong> on worldwide income (in most countries)</li>
              <li><strong>Capital gains tax</strong> on crypto sales</li>
              <li><strong>Reporting requirements</strong> (tax returns, declarations)</li>
              <li><strong>Potential double taxation</strong> if you're also a resident elsewhere</li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <p className="text-amber-900 dark:text-amber-300 font-semibold mb-2">⚠️ Real Example:</p>
              <p className="text-amber-800 dark:text-amber-200 mb-0">
                John, a US citizen, spends 200 days in Spain (thinking he's just "visiting"). Spain considers him a tax resident. He now owes <strong>19-26% Spanish capital gains tax</strong> on his crypto profits <strong>AND</strong> still owes US taxes (citizenship-based taxation). Result: double taxation nightmare.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How Different Countries Count Days</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇪🇸 Most Countries (Simple Rule)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>183 days in a calendar year = tax resident</strong>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Examples: Spain, Portugal, France, Germany, Italy, UAE, most of Latin America
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇬🇧 UK (Multiple Criteria)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  183 days OR:
                </p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• You have a home in the UK for 91+ days</li>
                  <li>• You work full-time in the UK</li>
                  <li>• Complex "sufficient ties" test</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-violet-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇺🇸 US (Citizenship-Based)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  US citizens are <strong>always</strong> tax residents, regardless of where they live. 183-day rule irrelevant.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Note: Non-citizens use "Substantial Presence Test" (183 days over 3-year weighted formula)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-rose-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇹🇭 Thailand (No Clear Rule)</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  180+ days = tax resident, but enforcement is inconsistent. Many nomads stay 179 days to be safe.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Perpetual Traveler Strategy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The "<strong>perpetual traveler</strong>" (or "PT") strategy involves staying <strong>less than 183 days</strong> in any single country to <strong>avoid tax residency everywhere</strong>.
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Example PT Schedule:</p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• Portugal: <strong>180 days</strong> (just under limit)</li>
                <li>• Thailand: <strong>90 days</strong></li>
                <li>• Mexico: <strong>60 days</strong></li>
                <li>• Colombia: <strong>35 days</strong></li>
                <li>• <strong>Total: 365 days, no tax residency anywhere</strong></li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">⚠️ Risks of This Strategy</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>No tax home = suspicious:</strong> If you're not a resident anywhere, tax authorities may challenge your status</li>
              <li><strong>Banking difficulties:</strong> Banks require a tax residency certificate—hard to get if you're not resident anywhere</li>
              <li><strong>Visa issues:</strong> Some countries track entries/exits closely</li>
              <li><strong>Substance requirements:</strong> Some countries require you to have a "substance" (home, ties) to claim non-residency elsewhere</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Track Your Days</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Manual Tracking Methods:</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span><strong>Passport stamps:</strong> Entry/exit dates (but many countries don't stamp anymore)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span><strong>Flight confirmations:</strong> Save all boarding passes and booking confirmations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span><strong>Hotel receipts:</strong> Proof of where you stayed and when</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span><strong>Credit card statements:</strong> Shows location of purchases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                  <span><strong>Spreadsheet:</strong> Simple date tracker with country + days</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Mistakes</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Counting Only "Full Days"</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Wrong.</strong> Most countries count any day you're physically present, even if you arrive at 11:59 PM. Arrival day = 1 day.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Assuming 182 Days is Safe</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Wrong.</strong> The rule is "183 days <strong>or more</strong>", meaning 183 = resident. Stay at 182 or less to be safe.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Not Keeping Proof</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  If a tax authority challenges your residency, <strong>you</strong> must prove where you were. No proof = they win.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-r-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">❌ Ignoring Other Ties</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  183 days isn't the <strong>only</strong> factor. Having a home, family, or business in a country can also trigger residency.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What If You Accidentally Trigger Residency?</h2>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <p className="text-amber-900 dark:text-amber-300 font-semibold mb-3">If you spent 183+ days in a country:</p>
              <ol className="space-y-2 text-amber-800 dark:text-amber-200">
                <li>1. <strong>Determine your tax obligations:</strong> File a tax return if required</li>
                <li>2. <strong>Check tax treaties:</strong> Your home country may have a treaty to prevent double taxation</li>
                <li>3. <strong>Consult a tax professional:</strong> Specialized in international tax law</li>
                <li>4. <strong>Plan better for next year:</strong> Use day tracking tools to stay under 183</li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Country-Specific 183-Day Rules</h2>

            <div className="overflow-x-auto my-8">
              <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900">
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-white font-bold">Country</th>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-white font-bold">Rule</th>
                    <th className="px-4 py-3 text-left text-slate-900 dark:text-white font-bold">Tax Rate (Crypto)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300 text-sm">
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇵🇹 Portugal</td>
                    <td className="px-4 py-3">183 days/year</td>
                    <td className="px-4 py-3">0% (for now)</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇪🇸 Spain</td>
                    <td className="px-4 py-3">183 days/year</td>
                    <td className="px-4 py-3">19-26%</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇹🇭 Thailand</td>
                    <td className="px-4 py-3">180 days/year</td>
                    <td className="px-4 py-3">0-35% (if remitted)</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇦🇪 UAE</td>
                    <td className="px-4 py-3">183 days/year</td>
                    <td className="px-4 py-3">0%</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇸🇬 Singapore</td>
                    <td className="px-4 py-3">183 days/year</td>
                    <td className="px-4 py-3">0% (long-term)</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3">🇩🇪 Germany</td>
                    <td className="px-4 py-3">183 days/year</td>
                    <td className="px-4 py-3">26%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Best Practices for Digital Nomads</h2>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3">✅ Recommended Approach:</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• <strong>Establish residency somewhere:</strong> Choose a low-tax country (UAE, Portugal, Panama) as your "tax home"</li>
                <li>• <strong>Track days meticulously:</strong> Use spreadsheet or app to log every country</li>
                <li>• <strong>Stay under 180 days</strong> in any country you're <strong>not</strong> a resident of</li>
                <li>• <strong>Keep proof:</strong> Save flight tickets, hotel receipts, passport stamps</li>
                <li>• <strong>File taxes:</strong> Even if you have no tax liability, file returns in your residency country</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Track Your Days Automatically</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub's Residency Tracker monitors your days in 167 countries and alerts you before you trigger tax residency.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
              >
                <Globe className="w-5 h-5" />
                Start Tracking
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
