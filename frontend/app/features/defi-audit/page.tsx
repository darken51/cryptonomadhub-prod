'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Activity, Layers, Sparkles, CheckCircle, Zap, FileDown, TrendingUp } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'
import { motion } from 'framer-motion'

export default function DeFiAuditFeaturePage() {
  return (
    <PublicPageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "DeFi Audit Tool - 50+ Blockchains Including Solana",
            "description": "Comprehensive DeFi transaction audit across 50+ blockchains including Ethereum, Solana, Arbitrum, Base, and all major Layer 2s. Auto-detect protocols like Uniswap, Aave, Jupiter, Raydium.",
            "url": "https://cryptonomadhub.com/features/defi-audit"
          })
        }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-emerald-50 via-teal-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-teal-900/30 text-emerald-700 dark:text-teal-300 text-sm font-bold mb-6">
              <Layers className="w-4 h-4" />
              SOLANA + 50+ CHAINS
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">DeFi Audit Tool</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Every Chain, Every Protocol
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Scan 50+ blockchains for DeFi activity. Full Solana support with Jupiter, Raydium, Orca, Marinade. All major Layer 2s included.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/defi-audit"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Start DeFi Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Supported Chains */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              50+ Blockchains Supported
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From Ethereum to Solana, all major chains and Layer 2s
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Major Networks', chains: ['Ethereum', 'Polygon', 'BSC', 'Avalanche', 'Fantom', 'Solana 🔥'] },
              { title: 'Layer 2s - Popular', chains: ['Arbitrum', 'Arbitrum Nova', 'Optimism', 'Base', 'Blast', 'Scroll'] },
              { title: 'Layer 2s - zkEVM', chains: ['zkSync Era', 'Linea', 'Mantle', 'Taiko', 'Polygon zkEVM'] },
              { title: 'Emerging Chains', chains: ['Berachain', 'Sei', 'Sonic', 'Abstract', 'World Chain', 'Unichain'] }
            ].map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.chains.map((chain, cidx) => (
                    <li key={cidx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {chain}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Auto-Detect Protocols
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Automatically identifies DeFi protocols and transaction types
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">EVM Protocols</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Uniswap V2/V3', 'Aave V2/V3', 'Compound', 'SushiSwap', 'Curve', 'Balancer', '1inch', 'Lido'].map((protocol) => (
                  <div key={protocol} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    {protocol}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Solana Protocols 🔥</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Jupiter', 'Raydium', 'Orca', 'Marinade', 'Drift', 'Mango', 'Phantom', 'Magic Eden'].map((protocol) => (
                  <div key={protocol} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    {protocol}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Transaction Analysis',
                description: 'Automatic detection of swaps, liquidity adds/removes, staking, lending, borrowing, NFT trades.'
              },
              {
                icon: FileDown,
                title: 'Export Reports',
                description: 'CSV and PDF export with full transaction history, gains/losses calculation, and fee tracking.'
              },
              {
                icon: TrendingUp,
                title: 'Tax Calculations',
                description: 'Short-term vs long-term gains, ordinary income from staking/mining, cost basis tracking.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Audit Your DeFi Activity Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect your wallet and get a complete tax report in minutes
          </p>
          <Link
            href="/defi-audit"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white hover:bg-slate-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Activity className="w-5 h-5 mr-2" />
            Start DeFi Audit
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  )
}
