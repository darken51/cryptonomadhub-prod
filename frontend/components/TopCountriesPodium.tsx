'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { TrendingUp, Users, Award } from 'lucide-react'

interface CountryScore {
  country_code: string
  country_name: string
  flag_emoji?: string
  score: number
}

interface TopCountriesPodiumProps {
  countries: any[]
}

export default function TopCountriesPodium({ countries }: TopCountriesPodiumProps) {
  const router = useRouter()

  // Extract top countries by category
  const getTopCountries = (category: 'crypto' | 'nomad' | 'overall'): CountryScore[] => {
    return countries
      .filter(c => c.ai_analysis)
      .map(c => ({
        country_code: c.country_code,
        country_name: c.country_name,
        flag_emoji: c.flag_emoji,
        score: category === 'crypto'
          ? c.ai_analysis.crypto_score
          : category === 'nomad'
          ? c.ai_analysis.nomad_score
          : c.ai_analysis.overall_score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  const topCrypto = getTopCountries('crypto')
  const topNomad = getTopCountries('nomad')
  const topOverall = getTopCountries('overall')

  // Olympic-style podium component
  const OlympicPodium = ({ countries }: { countries: CountryScore[] }) => {
    if (countries.length < 3) return null

    const getPodiumHeight = (position: number) => {
      if (position === 0) return 'h-56' // Gold - tallest
      if (position === 1) return 'h-44' // Silver - medium
      return 'h-36' // Bronze - shortest
    }

    const getPodiumBg = (position: number) => {
      if (position === 0) return 'from-yellow-400 to-yellow-600' // Gold
      if (position === 1) return 'from-gray-300 to-gray-500' // Silver
      return 'from-amber-600 to-amber-800' // Bronze
    }

    // Reorder: [2nd, 1st, 3rd] for podium display
    const podiumOrder = [countries[1], countries[0], countries[2]]
    const positions = [1, 0, 2]

    return (
      <div className="flex items-end justify-center gap-4 mb-8">
        {podiumOrder.map((country, idx) => {
          const position = positions[idx]
          return (
            <motion.div
              key={country.country_code}
              className="flex flex-col items-center cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              whileHover={{ y: -5 }}
              onClick={() => router.push(`/countries/${country.country_code.toLowerCase()}`)}
            >
              {/* Country card on top */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg mb-2 min-w-[160px] border-2 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 transition-colors">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getMedalIcon(position)}</div>
                  {country.flag_emoji && (
                    <div className="text-5xl mb-2">{country.flag_emoji}</div>
                  )}
                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                    {country.country_name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {country.country_code}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {country.score}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
                </div>
              </div>

              {/* Podium base */}
              <div
                className={`w-full ${getPodiumHeight(position)} bg-gradient-to-b ${getPodiumBg(position)} rounded-t-lg flex items-center justify-center shadow-xl`}
              >
                <div className="text-white font-bold text-6xl opacity-20">
                  {position + 1}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const getMedalColor = (position: number) => {
    if (position === 0) return 'from-yellow-400 to-yellow-600' // Gold
    if (position === 1) return 'from-gray-300 to-gray-400' // Silver
    return 'from-amber-600 to-amber-700' // Bronze
  }

  const getMedalIcon = (position: number) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    return '🥉'
  }

  const PodiumCard = ({
    title,
    icon: Icon,
    countries,
    color
  }: {
    title: string
    icon: any
    countries: CountryScore[]
    color: string
  }) => (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 border-2 ${color} shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {countries.map((country, idx) => (
          <motion.div
            key={country.country_code}
            className={`relative p-4 rounded-lg bg-gradient-to-r ${getMedalColor(idx)} text-white cursor-pointer`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push(`/countries/${country.country_code.toLowerCase()}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getMedalIcon(idx)}</span>
                {country.flag_emoji && (
                  <span className="text-3xl">{country.flag_emoji}</span>
                )}
                <div>
                  <div className="font-bold text-lg">{country.country_name}</div>
                  <div className="text-xs opacity-90">{country.country_code}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{country.score}</div>
                <div className="text-xs opacity-90">/ 100</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  if (topCrypto.length === 0) return null

  return (
    <div className="mb-8">
      {/* Overall Podium - Olympic Style */}
      <motion.div
        className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border-2 border-amber-300 dark:border-amber-700 shadow-xl mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            🏆 Overall Top Countries
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Best destinations combining crypto-friendliness and nomad lifestyle
          </p>
        </div>

        <OlympicPodium countries={topOverall} />
      </motion.div>

      {/* Crypto and Nomad Podiums */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Category Rankings
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Top countries by specific category
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PodiumCard
          title="Top Crypto Ecosystem"
          icon={TrendingUp}
          countries={topCrypto}
          color="border-violet-300 dark:border-violet-700"
        />
        <PodiumCard
          title="Top Digital Nomad"
          icon={Users}
          countries={topNomad}
          color="border-fuchsia-300 dark:border-fuchsia-700"
        />
      </div>
    </div>
  )
}
