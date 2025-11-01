'use client'

import Link from 'next/link'
import { CountryWithBadges, getPositionText, getCategoryLabel } from '@/lib/podiumHelpers'
import CountryScoreCard from '@/components/CountryScoreCard'

interface CountryCardWithBadgesProps {
  country: CountryWithBadges
  index: number
}

export default function CountryCardWithBadges({ country, index }: CountryCardWithBadgesProps) {
  const getBadgeColor = (category: 'overall' | 'crypto' | 'nomad') => {
    if (category === 'overall') return 'from-amber-500 to-yellow-500'
    if (category === 'crypto') return 'from-violet-500 to-fuchsia-500'
    return 'from-blue-500 to-cyan-500'
  }

  const getTaxRate = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return null
    return (rate * 100).toFixed(1)
  }

  const shortTermRate = country.crypto_short_rate ?? country.cgt_short_rate
  const longTermRate = country.crypto_long_rate ?? country.cgt_long_rate

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-fuchsia-700 transition-all hover:shadow-xl"
    >
      <Link href={`/countries/${country.country_code.toLowerCase()}`} className="block">
        {/* Header with Flag and Name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl" role="img" aria-label={`${country.country_name} flag`}>
              {country.flag_emoji || '🌍'}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {country.country_name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{country.country_code}</p>
            </div>
          </div>
        </div>

        {/* Podium Badges */}
        {country.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {country.badges.map((badge, idx) => (
              <div
                key={`${badge.category}-${badge.position}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getBadgeColor(badge.category)} text-white text-sm font-bold shadow-md`}
              >
                <span className="text-lg">{badge.medal}</span>
                <span>{getPositionText(badge.position)} {getCategoryLabel(badge.category)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Multi-podium winner highlight */}
        {country.badges.length >= 2 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 text-center">
              ⭐ {country.badges.length === 3 ? 'Triple' : 'Double'} Podium Winner!
            </p>
          </div>
        )}

        {/* Tax Rates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-lg p-4 ${
            country.crypto_short_rate !== null && country.crypto_short_rate !== undefined
              ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20'
              : 'bg-slate-50 dark:bg-slate-900'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              country.crypto_short_rate !== null && country.crypto_short_rate !== undefined
                ? 'text-violet-700 dark:text-violet-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {country.crypto_short_rate !== null && country.crypto_short_rate !== undefined ? 'Crypto ' : ''}Short-Term
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${
                shortTermRate === 0
                  ? 'text-green-600 dark:text-green-400'
                  : country.crypto_short_rate !== null && country.crypto_short_rate !== undefined
                  ? 'text-violet-900 dark:text-violet-200'
                  : 'text-slate-900 dark:text-slate-200'
              }`}>
                {getTaxRate(shortTermRate)}%
              </p>
              {shortTermRate === 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  Tax free!
                </span>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            country.crypto_long_rate !== null && country.crypto_long_rate !== undefined
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
              : 'bg-slate-50 dark:bg-slate-900'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              country.crypto_long_rate !== null && country.crypto_long_rate !== undefined
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {country.crypto_long_rate !== null && country.crypto_long_rate !== undefined ? 'Crypto ' : ''}Long-Term
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${
                longTermRate === 0
                  ? 'text-green-600 dark:text-green-400'
                  : country.crypto_long_rate !== null && country.crypto_long_rate !== undefined
                  ? 'text-emerald-900 dark:text-emerald-200'
                  : 'text-slate-900 dark:text-slate-200'
              }`}>
                {getTaxRate(longTermRate)}%
              </p>
              {longTermRate === 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  Tax free!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {country.ai_analysis && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <CountryScoreCard analysis={country.ai_analysis} />
          </div>
        )}

        {/* Crypto Notes */}
        {country.crypto_notes && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
              📝 Crypto-Specific Notes:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300">{country.crypto_notes}</p>
          </div>
        )}
      </Link>
    </div>
  )
}
