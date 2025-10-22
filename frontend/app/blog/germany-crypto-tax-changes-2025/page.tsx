'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle, TrendingDown, Calendar, Shield } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function GermanyCryptoTaxBlogPost() {
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
            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-full mb-4">
              Tax News
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Germany Crypto Tax Changes 2025: 26% to 42%?
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>August 5, 2025</span>
              </div>
              <span>6 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-8 mb-8 border-2 border-red-200 dark:border-red-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> Germany's coalition government has proposed eliminating the 0% tax on crypto held over 1 year and replacing it with a flat 30% capital income tax. If passed, this would make Germany one of Europe's least crypto-friendly countries.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Current Tax System (Still Active)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Germany currently has one of the most generous crypto tax systems in Europe. Here's how it works as of 2025:
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Current Rules (2025)</h3>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-200 mb-0">
                <li>• <strong>0% tax</strong> on crypto held <strong>over 12 months</strong></li>
                <li>• <strong>14.5%-45%</strong> progressive tax on crypto held <strong>under 12 months</strong> (plus 5.5% solidarity surcharge)</li>
                <li>• <strong>€1,000/year exemption</strong> on short-term gains (increased from €600 in 2024)</li>
                <li>• Crypto-to-crypto swaps are taxable events</li>
                <li>• Staking rewards extend holding period by 10 years (controversial rule)</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The Proposed Changes</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              In March 2025, during coalition negotiations between the SPD, CDU, and CSU, the Social Democratic Party (SPD) proposed a dramatic change:
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Proposed New System</h3>
                  <ul className="space-y-2 text-red-800 dark:text-red-200 mb-0">
                    <li>• <strong>30% flat tax</strong> on ALL crypto profits (regardless of holding period)</li>
                    <li>• <strong>Eliminates</strong> the 1-year tax-free holding period</li>
                    <li>• Treats crypto as <strong>capital income</strong> like stocks and bonds</li>
                    <li>• No more €1,000 exemption for crypto gains</li>
                    <li>• Same tax treatment for short-term and long-term holdings</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Before vs After Comparison</h2>

            <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Current System (2025)
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Long-term (>12 months):</div>
                    <div className="text-emerald-700 dark:text-emerald-300">0% tax ✓</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Short-term ({'<'}12 months):</div>
                    <div className="text-slate-700 dark:text-slate-300">14.5%-45% + 5.5% solidarity</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">€10,000 profit (held 13 months):</div>
                    <div className="text-emerald-700 dark:text-emerald-300 font-bold">€0 tax</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Proposed System
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Long-term (>12 months):</div>
                    <div className="text-red-700 dark:text-red-300">30% tax ✗</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Short-term ({'<'}12 months):</div>
                    <div className="text-red-700 dark:text-red-300">30% tax</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">€10,000 profit (any duration):</div>
                    <div className="text-red-700 dark:text-red-300 font-bold">€3,000 tax</div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Impact: Example</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Let's see how this would affect a typical long-term crypto investor:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Scenario: Michael's Bitcoin Investment</h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm mb-4">
                <li>• Bought 1 BTC in January 2023 for €20,000</li>
                <li>• Sold 1 BTC in February 2025 for €80,000</li>
                <li>• Profit: €60,000</li>
                <li>• Holding period: 25 months (over 1 year)</li>
              </ul>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-4">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Current Tax (2025):</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">€0</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Tax-free after 12 months</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                  <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">Proposed Tax:</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">€18,000</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">30% flat rate</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-semibold">
                Michael would pay <span className="text-red-600 dark:text-red-400">€18,000 more</span> under the proposed system.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Status of the Proposal</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              As of August 2025, this is still a <strong>proposal</strong> and has not been passed into law. Here's the timeline:
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">✓</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">March 2025: Proposal Announced</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">SPD proposes 30% capital income tax on all crypto during coalition talks</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">⏳</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Q3-Q4 2025: Parliamentary Review (NOW)</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Proposal being debated in Bundestag, facing significant opposition</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">?</div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">2026: Potential Implementation</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">If passed, likely effective January 1, 2026</div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Opposition and Pushback</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The proposal has faced significant criticism from:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>Crypto industry groups:</strong> Warning of brain drain and capital flight to other countries</li>
              <li><strong>CDU/CSU members:</strong> Coalition partners expressing reservations about the severity of changes</li>
              <li><strong>Individual investors:</strong> Long-term holders upset about losing tax-free status</li>
              <li><strong>Tech advocates:</strong> Arguing Germany should encourage innovation, not penalize it</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What Should German Crypto Holders Do?</h2>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-3">Action Plan:</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">1.</span>
                  <span><strong>Monitor the legislation:</strong> Follow Bundestag proceedings closely. The proposal may be amended or rejected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">2.</span>
                  <span><strong>Consider realizing gains in 2025:</strong> If you're past 12 months, selling before 2026 locks in 0% tax.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">3.</span>
                  <span><strong>Explore relocation options:</strong> Portugal (0% long-term), UAE (0% all), Switzerland (varies by canton).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">4.</span>
                  <span><strong>Consult a tax advisor:</strong> German tax law is complex. Get professional guidance before making major moves.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">5.</span>
                  <span><strong>Keep detailed records:</strong> Whatever happens, proper documentation is essential for compliance.</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Alternative Crypto-Friendly Countries</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              If the proposal passes, these countries may become more attractive:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇵🇹 Portugal</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% after 365 days | <strong>AI Score:</strong> 85/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Similar to Germany's current system. 0% on long-term gains ({'>'}365 days), 28% on short-term. EU member with excellent quality of life.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇦🇪 UAE (Dubai)</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% (all holdings) | <strong>AI Score:</strong> 86/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  No personal income tax, no capital gains tax. Higher cost of living but zero crypto tax regardless of holding period.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇨🇭 Switzerland</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% on capital gains (for individuals) | <strong>AI Score:</strong> 82/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Crypto treated as private assets. No capital gains tax for non-professional investors. High cost of living but stable regulations.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">🇸🇬 Singapore</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Crypto Tax:</strong> 0% (if not trading professionally) | <strong>AI Score:</strong> 86/100
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Tax-free for long-term investors. Very high cost of living and strict visa requirements, but excellent infrastructure.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Germany's proposed 30% flat tax on crypto would be a major policy reversal. If implemented, it would eliminate one of Europe's best crypto tax systems and potentially drive investors to more favorable jurisdictions.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              However, the proposal faces significant opposition and may not pass in its current form. Coalition governments often amend controversial proposals during parliamentary debate.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Stay informed:</strong> This is a developing situation. German crypto holders should monitor official government announcements and consult tax professionals before making major financial decisions.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Compare Germany with Other Countries</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Use our AI-powered tool to compare Germany's crypto tax system with 162 other countries.
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
