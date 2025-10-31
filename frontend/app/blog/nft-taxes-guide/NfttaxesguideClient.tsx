'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'

export default function NFTTaxesGuideBlogPost() {
  return (
    <PublicPageSSR>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-violet-600 dark:text-purple-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold rounded-full mb-4">
              DeFi Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              NFT Taxes: Complete Guide for Creators and Traders
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>May 20, 2025</span>
              </div>
              <span>10 min read</span>
              <span>By CryptoNomadHub Team</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8 border-2 border-violet-200 dark:border-violet-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-0">
                <strong>TL;DR:</strong> NFT sales are taxed as capital gains (0-37%). Creators pay income tax on initial sales and royalties. Minting costs add to cost basis. Gas fees are deductible. Cost basis tracking for NFT collections is complex but essential.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">NFT Tax Basics</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The IRS treats NFTs as <strong>property</strong>, similar to other cryptocurrencies. This means:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Key Tax Principles for NFTs:</h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• <strong>Selling NFTs = Capital gains tax</strong> (same as stocks or crypto)</li>
                <li>• <strong>Creating/minting NFTs = Potential income tax</strong> (if you're a creator/business)</li>
                <li>• <strong>Royalties = Income tax</strong> (taxed when received)</li>
                <li>• <strong>Buying NFTs = Not taxable</strong> (but creates cost basis for future sale)</li>
                <li>• <strong>Trading NFT for NFT = Taxable event</strong> (both sides recognize gain/loss)</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">For NFT Traders/Collectors</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">How Capital Gains Tax Works</h3>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Example 1: Basic NFT Sale</h4>

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span><strong>March 2024:</strong> Buy Bored Ape for 30 ETH ($60,000)</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>March 2025:</strong> Sell Bored Ape for 50 ETH ($125,000)</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                  <span className="font-bold">Cost Basis:</span>
                  <span>$60,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Sale Price:</span>
                  <span>$125,000</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Capital Gain:</span>
                  <span>$65,000</span>
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Tax Calculation (US):</strong><br/>
                  Long-term (&gt;1 year): $65,000 × 15% = <strong className="text-blue-700 dark:text-blue-400">$9,750 tax</strong><br/>
                  <span className="text-xs text-slate-600 dark:text-slate-400">(Assumes 15% bracket; could be 0%, 15%, or 20%)</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Cost Basis for NFTs</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Your <strong>cost basis</strong> includes:
            </p>

            <div className="space-y-3 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">1. Purchase Price</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  The amount you paid for the NFT (in USD value at time of purchase)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">2. Gas Fees (Purchase)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  The ETH gas fees you paid to buy the NFT can be added to cost basis
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">3. Platform Fees</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  OpenSea fees, LooksRare fees, etc. can be included
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-5 mb-8">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">💡 Tax Tip: Track Gas Fees</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Don't forget to add gas fees to your cost basis. If you paid $50 in gas to buy an NFT for $1,000, your cost basis is $1,050, not $1,000. This reduces your taxable gain.
              </p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">NFT-to-NFT Trades</h3>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-3">Important: Trading NFTs is Taxable</h4>
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                If you trade one NFT for another (e.g., swap your CryptoPunk for an Azuki), both sides of the trade are taxable events.
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Example: NFT Swap</h5>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div>You own: CryptoPunk (cost basis $100,000, current value $150,000)</div>
                  <div>You trade for: Azuki (current value $150,000)</div>
                  <div className="pt-2 border-t border-slate-300 dark:border-slate-600">
                    <strong>Tax Result:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• You recognize <span className="text-emerald-600 font-semibold">$50,000 capital gain</span> on the CryptoPunk</li>
                      <li>• Your cost basis in Azuki is now <span className="font-semibold">$150,000</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">For NFT Creators</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Initial NFT Sales: Income vs Capital Gains</h3>

            <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6 my-8">
              <h4 className="font-bold text-violet-900 dark:text-violet-300 mb-3">Creator Tax Treatment</h4>
              <p className="text-violet-800 dark:text-violet-200 mb-4">
                If you <strong>created</strong> the NFT (artist, musician, etc.), the IRS likely treats you as a <strong>business</strong>:
              </p>
              <ul className="space-y-2 text-violet-800 dark:text-violet-200">
                <li>• <strong>Primary sales = Ordinary income</strong> (taxed at 10-37%, plus 15.3% self-employment tax)</li>
                <li>• <strong>Royalties = Ordinary income</strong> (same treatment)</li>
                <li>• You can deduct business expenses (software, hardware, marketing, gas fees)</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-8 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Example: Artist Selling NFT Collection</h4>

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                <div>
                  <strong>Sarah creates 100 NFTs and sells them for 1 ETH each = 100 ETH ($250,000)</strong>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                  <div><strong>Income Tax:</strong></div>
                  <div>• Federal: $250,000 × 32% (example bracket) = $80,000</div>
                  <div>• Self-employment: $250,000 × 15.3% = $38,250</div>
                  <div className="font-bold text-blue-700 dark:text-blue-400 mt-2">Total Tax: ~$118,250</div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-4">
                  <div><strong>Deductible Expenses:</strong></div>
                  <div>• Procreate/Photoshop: $500</div>
                  <div>• Drawing tablet: $2,000</div>
                  <div>• Minting gas fees: $5,000</div>
                  <div>• Marketing: $10,000</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-2">Total Deductions: $17,500</div>
                </div>
                <div className="pt-2 border-t border-slate-300 dark:border-slate-600">
                  <strong>Net Taxable Income:</strong> $250,000 - $17,500 = $232,500
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Royalties</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              NFT royalties (typically 5-10% of secondary sales) are taxed as <strong>ordinary income</strong>:
            </p>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Royalty Tax Example:</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <div>Your NFT collection generates $50,000 in royalties in 2025</div>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mt-2">
                  <strong>Tax:</strong> $50,000 × 32% (income tax) + $50,000 × 15.3% (self-employment) = <strong className="text-red-700 dark:text-red-400">$23,650</strong>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  * Assumes 32% tax bracket. Your rate may differ.
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Minting Costs and Gas Fees</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">For Buyers</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Minting gas fees are part of your cost basis</strong>
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded p-3">
                  Example: Mint NFT for 0.1 ETH ($200) + $50 gas = Cost basis $250
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">For Creators</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Minting gas fees are business expenses</strong>
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded p-3">
                  Deduct gas fees from income when calculating profit
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Collectibles Tax Rate (Potential Issue)</h2>

            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">⚠️ Warning: 28% Collectibles Rate</h3>
              <p className="text-red-800 dark:text-red-200 mb-3">
                The IRS has not yet clarified whether NFTs qualify as <strong>"collectibles"</strong> under Section 408(m). If they do, long-term capital gains would be taxed at <strong>28%</strong> instead of 0-20%.
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Example Impact:</strong><br/>
                  $50,000 NFT gain (held &gt;1 year):<br/>
                  • Normal capital gains (20%): $10,000 tax<br/>
                  • If collectibles rate (28%): $14,000 tax<br/>
                  • <strong className="text-red-600 dark:text-red-400">Difference: $4,000 more in taxes</strong>
                </div>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-3">
                Most tax professionals currently treat NFTs as regular capital assets (0-20% rates), but this could change if IRS issues guidance.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common NFT Tax Scenarios</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Scenario 1: Free Mint</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Cost basis = $0 (plus gas fees)</strong><br/>
                  When you sell, entire sale price is capital gain
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Scenario 2: Received NFT as Gift</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Cost basis = Donor's original cost basis</strong><br/>
                  You inherit their cost basis and holding period
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Scenario 3: Airdropped NFT</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Taxed as ordinary income when received</strong><br/>
                  Fair market value at time of receipt = income (and new cost basis)
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Scenario 4: Sold NFT at a Loss</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Capital loss can offset other gains</strong><br/>
                  Up to $3,000 excess loss can offset ordinary income per year
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Record-Keeping for NFTs</h2>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-3">What to Track:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">For Every NFT Purchase:</h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Date purchased</li>
                    <li>• Price (in ETH and USD)</li>
                    <li>• Gas fees</li>
                    <li>• Platform fees</li>
                    <li>• Contract address</li>
                    <li>• Token ID</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">For Every NFT Sale:</h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <li>• Date sold</li>
                    <li>• Sale price (in ETH and USD)</li>
                    <li>• Gas fees</li>
                    <li>• Royalty amount (if creator)</li>
                    <li>• Transaction hash</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Final Thoughts</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              NFT taxes are complex because they combine elements of capital gains (for traders) and business income (for creators). Key takeaways:
            </p>

            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>Traders:</strong> Capital gains tax (0-20% or potentially 28%)</li>
              <li><strong>Creators:</strong> Ordinary income tax (10-37%) + self-employment tax (15.3%)</li>
              <li><strong>Gas fees:</strong> Add to cost basis (buyers) or deduct as expense (creators)</li>
              <li><strong>Royalties:</strong> Ordinary income for creators</li>
              <li><strong>NFT-to-NFT trades:</strong> Both sides are taxable</li>
              <li><strong>Record-keeping:</strong> Essential for every transaction</li>
            </ul>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Always consult a tax professional</strong> who understands NFTs. This is a rapidly evolving area, and IRS guidance may change.
            </p>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatic NFT Tax Tracking</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub automatically tracks NFT purchases, sales, cost basis, gas fees, and generates tax reports for OpenSea, Blur, LooksRare, and more.
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

      </PublicPageSSR>
  )
}
