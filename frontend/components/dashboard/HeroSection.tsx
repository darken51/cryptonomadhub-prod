/**
 * Dashboard Hero Section - Memoized for performance
 * Shows tax optimization score and recommendations
 */

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Sparkles, ArrowRight, AlertCircle, Wallet, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { CurrencyDisplay } from '@/components/CurrencyDisplay'
import { parseCurrencyData } from '@/lib/currency'

interface HeroSectionProps {
  user: any
  dashboardData: any
  walletPortfolio: any
  stats: any
  onRefreshWallet: () => void
}

export const HeroSection = memo(function HeroSection({
  user,
  dashboardData,
  walletPortfolio,
  stats,
  onRefreshWallet,
}: HeroSectionProps) {
  const getTaxScore = () => {
    const jurisdiction = dashboardData?.stats?.tax_jurisdiction
    if (!jurisdiction) return 0

    const taxHeavens = ['PT', 'AE', 'BH', 'KW', 'OM', 'QA', 'SA', 'MC', 'BM', 'KY', 'BS']
    if (taxHeavens.includes(jurisdiction)) return 10
    if (['SG', 'HK'].includes(jurisdiction)) return 8
    if (['CH', 'LU'].includes(jurisdiction)) return 7
    if (['US', 'FR', 'DE', 'AU'].includes(jurisdiction)) return 3
    return 5
  }

  const score = getTaxScore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-1">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.full_name || user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-lg text-white/70">
                Your personal crypto tax optimization dashboard
              </p>
            </div>

            {/* Plan Badge & Upgrade Button */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.license?.tier ? user.license.tier.charAt(0).toUpperCase() + user.license.tier.slice(1) : 'Free'} Plan
                </span>
              </div>

              {(!user?.license?.tier || user?.license?.tier === 'free') && (
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">Upgrade</span>
                </Link>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tax Score Card */}
            <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-yellow-300" />
                  Tax Optimization Score
                </h3>
                <div className="text-4xl font-bold text-white">{score}/10</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/80 text-sm">Current jurisdiction:</span>
                  <span className="font-bold text-white">
                    {dashboardData?.stats?.tax_jurisdiction || 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/80 text-sm">Potential savings:</span>
                  <span className="font-bold text-yellow-300 text-lg">
                    <CurrencyDisplay
                      amountUsd={dashboardData?.stats?.potential_tax_savings || stats.totalSavings || 0}
                      amountLocal={dashboardData?.stats?.potential_tax_savings_local}
                      currencyData={parseCurrencyData(dashboardData?.stats)}
                      mode="dual"
                    />
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations Card */}
            <RecommendationsCard
              dashboardData={dashboardData}
            />
          </div>

          {/* Wallet Portfolio Stats */}
          {walletPortfolio?.total_wallets > 0 ? (
            <WalletStats
              portfolio={walletPortfolio}
              onRefresh={onRefreshWallet}
            />
          ) : (
            <BasicStats stats={stats} dashboardData={dashboardData} />
          )}
        </div>
      </div>
    </motion.div>
  )
})

// ✅ OPTIMIZATION: Memoized sub-components
const RecommendationsCard = memo(function RecommendationsCard({
  dashboardData,
}: {
  dashboardData: any
}) {
  const recommendations = [
    { code: 'AE', name: 'UAE', rate: '0%', flag: '🇦🇪', savings: 'Up to 100%' },
    { code: 'SG', name: 'Singapore', rate: '0%', flag: '🇸🇬', savings: 'Up to 100%' },
    { code: 'HK', name: 'Hong Kong', rate: '0%', flag: '🇭🇰', savings: 'Up to 100%' }
  ]

  return (
    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-300" />
        Top Recommendations
      </h3>

      {dashboardData?.stats?.tax_jurisdiction ? (
        <div>
          <p className="text-sm text-white/80 mb-4">
            Based on your profile, these jurisdictions could save you money:
          </p>

          <div className="space-y-3">
            {recommendations
              .filter(c => c.code !== dashboardData.stats.tax_jurisdiction)
              .slice(0, 3)
              .map((country) => (
                <Link
                  key={country.code}
                  href={`/simulations/new?current=${dashboardData.stats.tax_jurisdiction}&target=${country.code}`}
                  className="block bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <div className="font-bold text-white group-hover:text-yellow-300 transition-colors">
                          {country.name}
                        </div>
                        <div className="text-xs text-white/60">
                          Crypto tax: {country.rate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-sm mb-1">
                        {country.savings}
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-white/80 mb-4 max-w-xs">
            Set your tax jurisdiction to unlock personalized recommendations
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Set Jurisdiction Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
})

const WalletStats = memo(function WalletStats({
  portfolio,
  onRefresh,
}: {
  portfolio: any
  onRefresh: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          Wallet Portfolio
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="text-sm text-white/60 hover:text-white/80 transition-colors"
            title="Refresh wallet data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/wallets"
            className="text-sm text-violet-300 hover:text-violet-200 font-semibold flex items-center gap-1"
          >
            View all wallets
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
          <div className="text-xs text-white/60 mb-1">Total Value</div>
          <div className="text-xl font-bold text-white mb-1">
            <CurrencyDisplay
              amountUsd={portfolio.total_value_usd}
              mode="dual"
            />
          </div>
          {portfolio.change_24h_usd !== null && (
            <div className={`text-xs flex items-center gap-1 ${portfolio.change_24h_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.change_24h_usd >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {portfolio.change_24h_usd >= 0 ? '+' : ''}${Math.abs(portfolio.change_24h_usd).toFixed(2)}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
          <div className="text-xs text-white/60 mb-1">Unrealized P&L</div>
          <div className={`text-xl font-bold ${portfolio.total_unrealized_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.total_unrealized_gain_loss >= 0 ? '+' : ''}
            <CurrencyDisplay
              amountUsd={Math.abs(portfolio.total_unrealized_gain_loss)}
              mode="dual"
            />
          </div>
          <div className={`text-xs ${portfolio.unrealized_gain_loss_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.unrealized_gain_loss_percent >= 0 ? '+' : ''}
            {portfolio.unrealized_gain_loss_percent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
          <div className="text-xs text-white/60 mb-1">Wallets</div>
          <div className="text-xl font-bold text-white">{portfolio.total_wallets}</div>
          <div className="text-xs text-white/60">{portfolio.total_tokens} tokens</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
          <div className="text-xs text-white/60 mb-1">Chains</div>
          <div className="text-xl font-bold text-white">{portfolio.total_chains}</div>
          <div className="text-xs text-white/60">Multi-chain tracking</div>
        </div>
      </div>
    </>
  )
})

const BasicStats = memo(function BasicStats({
  stats,
  dashboardData,
}: {
  stats: any
  dashboardData: any
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
        <div className="text-2xl font-bold text-white mb-1">{stats.count}</div>
        <div className="text-xs text-white/60">Simulations</div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
        <div className="text-2xl font-bold text-white mb-1">{dashboardData?.stats?.total_audits || 0}</div>
        <div className="text-xs text-white/60">DeFi Audits</div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all">
        <div className="text-2xl font-bold text-white mb-1">{stats.countriesCompared}</div>
        <div className="text-xs text-white/60">Countries Compared</div>
      </div>
    </div>
  )
})
