'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, Play, CheckCircle } from 'lucide-react'
import { PublicPageSSR } from '@/components/PublicPageSSR'

export default function FirstDeFiAuditDoc() {
  return (
    <PublicPageSSR>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold rounded-full mb-4">
              Tutorial
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Running Your First DeFi Audit
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Complete guide to auditing DeFi transactions across 50+ chains and protocols.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>10 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is a DeFi Audit?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              A DeFi Audit automatically scans your wallet address across <strong>50+ blockchains</strong> and detects all DeFi transactions including:
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 mb-6">
              <li>✅ Token swaps (Uniswap, Jupiter, PancakeSwap)</li>
              <li>✅ Liquidity providing (Curve, Raydium, Balancer)</li>
              <li>✅ Lending & borrowing (Aave, Compound, Solend)</li>
              <li>✅ Staking rewards (Lido, Marinade, Rocket Pool)</li>
              <li>✅ Yield farming (Yearn, Beefy, Convex)</li>
              <li>✅ NFT trades (OpenSea, Blur, Magic Eden)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>No CSV uploads needed</strong> - just provide your wallet address and our AI handles the rest.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Prerequisites</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Connected wallet (see <Link href="/docs/connect-wallet" className="text-blue-600 dark:text-indigo-400 hover:underline">How to Connect Your Wallet</Link>)</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">At least one DeFi transaction in your wallet history</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">2-5 minutes (audit processing time)</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 1: Navigate to DeFi Audit</h2>
            <ol className="space-y-3 list-decimal list-inside text-slate-700 dark:text-slate-300 mb-6">
              <li>Log in to CryptoNomadHub</li>
              <li>Click <strong>"DeFi Audit"</strong> in the sidebar</li>
              <li>You'll see a list of your connected wallets</li>
            </ol>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 2: Select a Wallet</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Choose which wallet you want to audit:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3"><strong>Example:</strong></p>
              <div className="space-y-2">
                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-transparent hover:border-blue-500">
                  <div className="font-semibold text-slate-900 dark:text-white">Main Ethereum Wallet</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">0x1234...abcd</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ethereum • 247 transactions</div>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="font-semibold text-slate-900 dark:text-white">Solana DeFi</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">ABC123...XYZ</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Solana • 89 transactions</div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 3: Click "Start Audit"</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Click the <strong>"Start Audit"</strong> button next to your selected wallet.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Our AI will immediately begin scanning:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>All transactions from your wallet</li>
              <li>DeFi protocol interactions (Uniswap, Jupiter, Aave, etc.)</li>
              <li>Token swaps, LP positions, staking, lending</li>
              <li>NFT purchases and sales</li>
              <li>Gas fees paid</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 4: Wait for Audit Completion</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              The audit typically takes <strong>2-5 minutes</strong> depending on transaction volume:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                  <span className="text-slate-700 dark:text-slate-300">Scanning blockchain data...</span>
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-semibold">Complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">Detecting DeFi protocols...</span>
                  <span className="ml-auto text-blue-600 dark:text-blue-400 font-semibold">60%</span>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-300">Calculating cost basis...</span>
                </div>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              You can leave the page and come back - the audit runs in the background.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 5: Review Audit Results</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Once complete, you'll see a comprehensive breakdown:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">📊 Transaction Summary</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Total transactions: 247</li>
                  <li>• DeFi interactions: 189</li>
                  <li>• Token swaps: 156</li>
                  <li>• LP positions: 12</li>
                  <li>• NFT trades: 8</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">🏦 Protocols Detected</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Uniswap V3: 89 transactions</li>
                  <li>• Aave V3: 34 transactions</li>
                  <li>• Curve Finance: 12 transactions</li>
                  <li>• OpenSea: 8 transactions</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">💰 Tax Implications</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <li>• Total realized gains: $12,450</li>
                  <li>• Total realized losses: $3,200</li>
                  <li>• Net taxable gain: $9,250</li>
                  <li>• Gas fees paid: $1,840</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 6: Export Results</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Export your audit results in multiple formats:
            </p>
            <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">📄 CSV Export</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Complete transaction list for Excel or Google Sheets
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-5 border border-rose-200 dark:border-rose-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">📑 PDF Report</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Professional report for accountants or IRS
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">🏛️ Form 8949</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  IRS-compliant tax form ready for filing
                </p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-5 border border-violet-200 dark:border-violet-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">💾 JSON</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Raw data for developers or custom integrations
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Supported Chains & Protocols</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">EVM Chains (Ethereum-compatible):</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche, BNB Chain, Fantom, zkSync, Linea, Scroll, and 20+ more
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Solana Ecosystem:</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Full Solana DeFi support</strong> including Jupiter, Raydium, Orca, Marinade, Solend, Mango Markets, and more
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">DeFi Protocols (50+):</h3>
            <div className="grid md:grid-cols-3 gap-3 mb-6 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <strong>DEXs:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Uniswap V2/V3</li>
                  <li>Jupiter (Solana)</li>
                  <li>PancakeSwap</li>
                  <li>SushiSwap</li>
                  <li>Raydium</li>
                </ul>
              </div>
              <div>
                <strong>Lending:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Aave V2/V3</li>
                  <li>Compound</li>
                  <li>Solend</li>
                  <li>Maker</li>
                </ul>
              </div>
              <div>
                <strong>Staking:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Lido</li>
                  <li>Marinade (Solana)</li>
                  <li>Rocket Pool</li>
                  <li>Curve</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Tips for Best Results</h2>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-3 mb-6">
              <li><strong>Audit multiple wallets:</strong> Run audits on all your wallets to get a complete portfolio view</li>
              <li><strong>Re-run periodically:</strong> Run audits monthly or quarterly to track new transactions</li>
              <li><strong>Check protocol coverage:</strong> If a protocol isn't auto-detected, you can manually add transactions</li>
              <li><strong>Export before tax season:</strong> Generate Form 8949 and reports in January/February</li>
            </ul>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Next Steps</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                After running your DeFi audit, optimize your taxes with:
              </p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 mb-6">
                <li>• <Link href="/docs/cost-basis-methods" className="text-violet-600 dark:text-violet-400 hover:underline">Choose a cost basis method</Link> (FIFO/LIFO/HIFO)</li>
                <li>• <Link href="/docs/wash-sale-detection" className="text-violet-600 dark:text-violet-400 hover:underline">Check for wash sales</Link></li>
                <li>• Find tax loss harvesting opportunities</li>
              </ul>
              <Link
                href="/defi-audit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Your First Audit
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageSSR>
  )
}
