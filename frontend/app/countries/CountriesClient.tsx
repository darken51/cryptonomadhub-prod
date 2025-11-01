'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import CountryAutocomplete from '@/components/CountryAutocomplete'
import CountryCardWithBadges from '@/components/CountryCardWithBadges'
import { getPodiumCountriesWithBadges } from '@/lib/podiumHelpers'

// Lazy load heavy components to improve initial page load
const WorldTaxMap = dynamic(() => import('@/components/WorldTaxMap'), {
  loading: () => <div className="h-[400px] bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse flex items-center justify-center">
    <div className="text-slate-400 dark:text-slate-500">Loading world map...</div>
  </div>,
  ssr: false
})

const TopCountriesPodium = dynamic(() => import('@/components/TopCountriesPodium'), {
  loading: () => <div className="h-[300px] bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse" />,
  ssr: false
})

interface AIAnalysis {
  crypto_score: number
  nomad_score: number
  overall_score: number
  crypto_analysis: string
  nomad_analysis: string
  key_advantages: string[]
  key_disadvantages: string[]
  best_for: string[]
  crypto_score_breakdown: {
    tax_favorability: number
    legal_clarity: number
    crypto_adoption: number
    innovation_ecosystem: number
  }
  nomad_score_breakdown: {
    cost_of_living: number
    visa_accessibility: number
    infrastructure: number
    expat_community: number
  }
  generated_at: string
  expires_at: string
  confidence: number
  is_expired: boolean
}

interface Country {
  country_code: string
  country_name: string
  flag_emoji?: string
  source_url?: string
  cgt_short_rate: number
  cgt_long_rate: number
  crypto_short_rate?: number
  crypto_long_rate?: number
  crypto_notes?: string
  crypto_legal_status?: 'legal' | 'banned' | 'restricted' | 'unclear'
  notes?: string
  data_quality?: 'high' | 'medium' | 'low' | 'unknown'
  data_sources?: string[]
  updated_at?: string
  holding_period_months?: number
  is_flat_tax?: boolean
  is_progressive?: boolean
  is_territorial?: boolean
  crypto_specific?: boolean
  long_term_discount_pct?: number
  exemption_threshold?: number
  exemption_threshold_currency?: string
  ai_analysis?: AIAnalysis
}

interface CountriesClientProps {
  initialCountries: Country[]
}

export default function CountriesClient({ initialCountries }: CountriesClientProps) {
  // Extract podium countries with their badges (7 unique countries from all podiums)
  const podiumCountries = useMemo(
    () => getPodiumCountriesWithBadges(initialCountries),
    [initialCountries]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title - No animation for faster LCP */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
          Country Tax Regulations
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse crypto tax rates for {initialCountries.length}+ countries with verified data and real-time updates
        </p>
      </div>

      {/* Autocomplete Search */}
      <div className="mb-8">
        <CountryAutocomplete countries={initialCountries} />
      </div>

      {/* Info Banner */}
      <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-violet-800 dark:text-violet-200">
            <p className="font-semibold mb-1">Crypto vs General Capital Gains</p>
            <p>Some countries have different tax rates for cryptocurrencies compared to general capital gains. Crypto-specific rates are shown when available.</p>
          </div>
        </div>
      </div>

    {/* SEO Content Section - Moved up for better UX */}
    <motion.div
      className="my-8 bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        Understanding Crypto Tax Rates Worldwide
      </h2>

      <div className="prose dark:prose-invert max-w-none">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Countries with 0% Crypto Tax
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Several countries offer <strong>zero capital gains tax on cryptocurrency</strong>, making them attractive
              for digital nomads and crypto investors:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Portugal</strong> - 0% crypto tax after 1 year holding period</li>
              <li><strong>UAE (Dubai)</strong> - 0% personal income tax on crypto gains</li>
              <li><strong>Singapore</strong> - 0% capital gains tax on long-term holdings</li>
              <li><strong>Switzerland</strong> - 0% tax on private crypto gains for individuals</li>
              <li><strong>Germany</strong> - 0% tax after 1 year holding period</li>
              <li><strong>Malaysia</strong> - 0% capital gains tax on crypto</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              How We Verify Tax Data
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Our crypto tax rates are sourced from <strong>official government publications</strong> and verified
              by leading international tax authorities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>OECD</strong> - International tax policy data</li>
              <li><strong>PwC Tax Summaries</strong> - Professional tax firm reports</li>
              <li><strong>KPMG</strong> - Global tax rate surveys</li>
              <li><strong>Government websites</strong> - Direct source verification</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
            Capital Gains Tax vs. Crypto-Specific Tax
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            Many countries treat cryptocurrency differently from traditional assets. While some apply standard
            <strong> capital gains tax (CGT)</strong> rates, others have introduced <strong>crypto-specific regulations</strong>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li><strong>Short-term gains</strong> - Typically taxed at higher rates (held &lt; 1 year)</li>
            <li><strong>Long-term gains</strong> - Lower rates for assets held &gt; 1 year</li>
            <li><strong>Income vs. gains</strong> - Mining, staking, DeFi yields often taxed as income</li>
            <li><strong>Wash sale rules</strong> - Some countries restrict loss harvesting strategies</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">
            💡 How to Use This Database
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
            <li><strong>Search by country name</strong> or use the interactive world map to explore tax rates</li>
            <li><strong>Filter by crypto-friendly countries</strong> (&lt;10% tax) to narrow your options</li>
            <li><strong>Compare multiple countries</strong> side-by-side using our AI scoring system</li>
            <li><strong>Check data quality badges</strong> to ensure you're using verified information</li>
            <li><strong>Consult with tax professionals</strong> - this data is for informational purposes only</li>
          </ol>
        </div>
      </div>
    </motion.div>

      {/* Podium Countries List - Priority content for LCP */}
      <div className="space-y-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Top Destinations
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Countries featured in our podiums - the best performers for crypto investors and digital nomads
          </p>
        </div>

        {podiumCountries.map((country, index) => (
          <CountryCardWithBadges key={country.country_code} country={country} index={index} />
        ))}
      </div>

      {/* Can't find your country notice */}
      <div className="mt-8 mb-12 bg-slate-50 dark:bg-slate-900 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-700">
        <p className="text-slate-700 dark:text-slate-300 text-lg">
          Can't find your country? Use the <strong>search bar above</strong> or click on the <strong>interactive map below</strong> to explore all {initialCountries.length} countries!
        </p>
      </div>

      {/* World Map - Moved below fold for better LCP */}
      {initialCountries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Interactive World Tax Map
          </h2>
          <WorldTaxMap countries={initialCountries} />
        </div>
      )}

      {/* Top Countries Podium - Moved below fold */}
      {initialCountries.length > 0 && (
        <TopCountriesPodium countries={initialCountries} />
      )}

    {/* Disclaimer */}
    <motion.div
      className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm text-yellow-900 dark:text-yellow-200">
        ⚠️ <strong>Disclaimer:</strong> Tax rates shown are for informational purposes only and may not reflect the most current regulations. Always consult a qualified tax professional for accurate advice. Last updated: {new Date().toLocaleDateString()}
      </p>
    </motion.div>
  </div>
  )
}
