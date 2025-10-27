'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Shield } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function SolanaDeFiTaxesBlogPost() {
  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Do I need to report every Jupiter swap?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Every crypto-to-crypto swap (even SOL to USDC) is a taxable event that must be reported on Form 8949."
                }
              },
              {
                "@type": "Question",
                "name": "Is providing liquidity on Raydium taxable?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Adding liquidity is generally not taxable. Earning fees = taxable income. Removing liquidity = capital gain/loss."
                }
              },
              {
                "@type": "Question",
                "name": "What about mSOL appreciation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not taxable until you unstake/sell. The gain is taxed when you convert mSOL back to SOL or sell it."
                }
              }
            ]
          })
        }}
      />
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
              Solana DeFi Taxes: Jupiter, Raydium, Orca Explained
            </h1>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>September 5, 2025</span>
              </div>
              <span>10 min read</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-slate-700 dark:text-slate-300 mb-8 font-semibold">
              Solana DeFi is exploding, but how do you report Jupiter swaps, Raydium liquidity, and Marinade staking for taxes? This complete guide covers every transaction type on Solana.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Why Solana DeFi is Different</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Solana DeFi has unique characteristics that affect tax reporting:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>Ultra-low fees:</strong> $0.001-0.01 per transaction (vs $5-50 on Ethereum)</li>
              <li><strong>High frequency:</strong> Cheap transactions = more trading = more tax events</li>
              <li><strong>Unique protocols:</strong> Jupiter, Raydium, Orca have different transaction structures</li>
              <li><strong>SPL tokens:</strong> Solana's token standard (not ERC-20)</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Solana DeFi Protocols</h2>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🪐 Jupiter</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  DEX aggregator that finds best swap routes across all Solana DEXs
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Tax Impact:</strong> Each swap = taxable event
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">⚡ Raydium</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Automated Market Maker (AMM) with liquidity pools
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Tax Impact:</strong> LP deposits, withdrawals, and rewards all taxable
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🐋 Orca</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  User-friendly AMM with concentrated liquidity (Whirlpools)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Tax Impact:</strong> Similar to Raydium, plus impermanent loss tracking
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🥩 Marinade</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Liquid staking protocol (stake SOL, receive mSOL)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Tax Impact:</strong> Staking rewards = taxable income when received
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Tax Treatment by Transaction Type</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Token Swaps (Jupiter, Raydium, Orca)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Tax Treatment:</strong> Taxable event = capital gain or loss
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Example: Jupiter Swap</p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li>• You swap 100 SOL → 1,500 USDC</li>
                <li>• Your cost basis for SOL: $50/SOL = $5,000</li>
                <li>• Sale price: $15/SOL = $15,000</li>
                <li>• <strong>Capital gain: $10,000 (taxable)</strong></li>
                <li>• New cost basis for USDC: $1/USDC = $1,500</li>
              </ul>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Important:</strong> Even SOL → USDC swaps are taxable! "Stablecoin swaps" are not exempt.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Liquidity Providing (Raydium, Orca)</h3>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Step 1: Adding Liquidity</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Tax Treatment:</strong> <span className="text-emerald-600">Generally not taxable</span> (no disposal of assets)
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You deposit 50 SOL + 750 USDC into Raydium SOL-USDC pool. You receive LP tokens representing your share. This is like a "deposit" - no sale, no tax yet.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Step 2: Earning Trading Fees</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Tax Treatment:</strong> <span className="text-amber-600">Taxable as income</span> when claimed
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You earn $500 in trading fees (in SOL/USDC). This is ordinary income taxed at your regular tax rate (10-37%).
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Step 3: Removing Liquidity</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Tax Treatment:</strong> <span className="text-rose-600">Capital gain/loss</span> on the difference
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    You withdraw and receive 55 SOL + 800 USDC (more than you deposited due to fees).
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Compare:</strong> Initial deposit value vs withdrawal value. The gain/loss is taxable.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Liquid Staking (Marinade)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Marinade lets you stake SOL and receive mSOL (liquid staking token).
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <p className="font-bold text-slate-900 dark:text-white mb-3">Tax Breakdown:</p>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400">1.</span>
                  <div>
                    <p className="font-semibold">Staking SOL → mSOL</p>
                    <p className="text-sm">You exchange 100 SOL for 95 mSOL (1:0.95 ratio)</p>
                    <p className="text-sm text-emerald-600 font-semibold">✅ Generally not taxable (like-kind exchange view)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400">2.</span>
                  <div>
                    <p className="font-semibold">mSOL Appreciates</p>
                    <p className="text-sm">Over time, mSOL:SOL ratio increases (e.g., 1:1.05)</p>
                    <p className="text-sm text-blue-600 font-semibold">🔵 Not taxable until you unstake/sell</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400">3.</span>
                  <div>
                    <p className="font-semibold">Unstaking mSOL → SOL</p>
                    <p className="text-sm">You exchange 95 mSOL back and receive 105 SOL (you gained 5 SOL)</p>
                    <p className="text-sm text-amber-600 font-semibold">⚠️ 5 SOL gain = taxable income</p>
                  </div>
                </li>
              </ol>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. NFT Trading (Magic Eden)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Solana NFTs are treated like any other NFT:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><strong>Buying:</strong> Not taxable (establishes cost basis)</li>
              <li><strong>Selling:</strong> Capital gain/loss (sale price - cost basis)</li>
              <li><strong>Royalties (creators):</strong> Ordinary income when received</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Tax Scenarios</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Scenario 1: Day Trader on Jupiter</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  You make 500 swaps per month (cheap fees!). Each swap is a taxable event.
                </p>
                <p className="text-sm text-slate-900 dark:text-white font-semibold">
                  Tax Impact: 6,000 transactions/year = complex Form 8949
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                  ✅ CryptoNomadHub auto-detects Jupiter swaps and calculates gains/losses
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Scenario 2: Raydium LP Provider</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  You provide liquidity to SOL-USDC pool, earn $2,000 in fees over 6 months.
                </p>
                <p className="text-sm text-slate-900 dark:text-white font-semibold">
                  Tax Impact: $2,000 ordinary income + capital gain/loss on withdrawal
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Scenario 3: Marinade Staker</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  You stake 1,000 SOL on Marinade, earn ~5% APY (50 SOL/year).
                </p>
                <p className="text-sm text-slate-900 dark:text-white font-semibold">
                  Tax Impact: 50 SOL = taxable income when you unstake and realize the gain
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Report Solana DeFi on Your Taxes</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Step-by-Step Filing</h3>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                  <span><strong>Gather transaction history</strong> from all Solana wallets (Phantom, Solflare, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                  <span><strong>Use DeFi audit tool</strong> to automatically detect Jupiter, Raydium, Orca, Marinade transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                  <span><strong>Calculate cost basis</strong> for each transaction (FIFO, LIFO, or HIFO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                  <span><strong>Export Form 8949</strong> with all capital gains/losses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                  <span><strong>Report staking income</strong> on Schedule 1 (additional income)</span>
                </li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Key Differences vs Ethereum DeFi</h2>

            <div className="grid md:grid-cols-2 gap-4 not-prose my-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">🔷 Ethereum</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• High gas fees = fewer transactions</li>
                  <li>• Easier to track (100-500 txns/year)</li>
                  <li>• Uniswap, Aave standard protocols</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">⚡ Solana</h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>• Ultra-low fees = thousands of transactions</li>
                  <li>• Harder to track manually</li>
                  <li>• Jupiter, Raydium, Orca unique structures</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <p className="text-amber-900 dark:text-amber-300 font-semibold mb-2">⚠️ Don't Forget Gas Fees</p>
              <p className="text-amber-800 dark:text-amber-200 mb-0">
                While Solana gas fees are tiny ($0.001), they're still deductible! Over 1,000 transactions, this adds up to ~$1-10 in deductions.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Common Questions</h2>

            <div className="space-y-6 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Q: Do I need to report every Jupiter swap?</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  <strong>A:</strong> Yes. Every crypto-to-crypto swap (even SOL to USDC) is a taxable event that must be reported on Form 8949.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Q: Is providing liquidity on Raydium taxable?</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  <strong>A:</strong> Adding liquidity is generally not taxable. Earning fees = taxable income. Removing liquidity = capital gain/loss.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Q: What about mSOL appreciation?</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  <strong>A:</strong> Not taxable until you unstake/sell. The gain is taxed when you convert mSOL back to SOL or sell it.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automate Solana DeFi Tax Tracking</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                CryptoNomadHub automatically detects and categorizes all Solana DeFi transactions including Jupiter, Raydium, Orca, and Marinade. Generate Form 8949 in seconds.
              </p>
              <Link
                href="/defi-audit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Audit Solana Wallet
              </Link>
            </div>

            {/* Related Articles */}
            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/blog/nft-taxes-guide"
                  className="group p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:shadow-lg"
                >
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    NFT Taxes: Complete Guide
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    How to report NFT sales, royalties, and minting costs for tax purposes.
                  </p>
                </Link>

                <Link
                  href="/blog/fifo-lifo-hifo-comparison"
                  className="group p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:shadow-lg"
                >
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    FIFO vs LIFO vs HIFO
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Cost basis methods comparison - which saves the most tax?
                  </p>
                </Link>

                <Link
                  href="/blog/wash-sale-rule-crypto"
                  className="group p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:shadow-lg"
                >
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    Wash Sale Rule for Crypto
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Understanding the 30-day wash sale rule and how it applies to crypto.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
