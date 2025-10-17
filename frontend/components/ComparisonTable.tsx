'use client'

import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface Feature {
  name: string
  cryptoNomad: string | boolean
  koinly: string | boolean
  coinTracker: string | boolean
}

const features: Feature[] = [
  {
    name: 'Countries Supported',
    cryptoNomad: '160+',
    koinly: '~100',
    coinTracker: '~20'
  },
  {
    name: 'AI Chat Assistant',
    cryptoNomad: true,
    koinly: false,
    coinTracker: false
  },
  {
    name: 'DeFi Audit',
    cryptoNomad: true,
    koinly: 'Basic',
    coinTracker: 'Basic'
  },
  {
    name: 'Tax Optimizer',
    cryptoNomad: true,
    koinly: false,
    coinTracker: 'Limited'
  },
  {
    name: 'Cost Basis Tracking',
    cryptoNomad: true,
    koinly: true,
    coinTracker: true
  },
  {
    name: 'Exchange Sync',
    cryptoNomad: true,
    koinly: true,
    coinTracker: true
  },
  {
    name: 'TurboTax Export',
    cryptoNomad: true,
    koinly: true,
    coinTracker: true
  }
]

export function ComparisonTable() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Why Choose CryptoNomadHub?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The most comprehensive crypto tax platform on the market
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Feature
              </th>
              <th className="px-6 py-4 text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                    CryptoNomadHub
                  </span>
                  <span className="text-xs text-violet-600 dark:text-fuchsia-400 font-semibold mt-1">
                    ⭐ RECOMMENDED
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                Koinly
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                CoinTracker
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {features.map((feature, index) => (
              <motion.tr
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {feature.name}
                </td>
                <td className="px-6 py-4 text-center bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-violet-900/10 dark:to-fuchsia-900/10">
                  {renderCell(feature.cryptoNomad, true)}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderCell(feature.koinly, false)}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderCell(feature.coinTracker, false)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              {feature.name}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-violet-600 dark:text-fuchsia-400 font-medium">
                  CryptoNomadHub
                </span>
                {renderCell(feature.cryptoNomad, true)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Koinly</span>
                {renderCell(feature.koinly, false)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">CoinTracker</span>
                {renderCell(feature.coinTracker, false)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function renderCell(value: string | boolean, isHighlighted: boolean) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check
        className={`w-5 h-5 mx-auto ${
          isHighlighted
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-emerald-500 dark:text-emerald-500'
        }`}
      />
    ) : (
      <X className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-600" />
    )
  }

  return (
    <span
      className={`text-sm font-medium ${
        isHighlighted
          ? 'text-violet-600 dark:text-fuchsia-400 font-bold'
          : 'text-slate-700 dark:text-slate-300'
      }`}
    >
      {value}
    </span>
  )
}
