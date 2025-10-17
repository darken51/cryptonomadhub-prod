'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, TrendingDown } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

// Simplified tax rates for quick calculation (real data should come from API)
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', cgtRate: 0.238 },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', cgtRate: 0.28 },
  { code: 'AE', name: 'UAE (Dubai)', flag: '🇦🇪', cgtRate: 0.0 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', cgtRate: 0.0 }, // 0% after 1 year
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', cgtRate: 0.0 },
  { code: 'FR', name: 'France', flag: '🇫🇷', cgtRate: 0.30 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', cgtRate: 0.20 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', cgtRate: 0.23 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', cgtRate: 0.235 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', cgtRate: 0.25 },
]

export function InteractiveTaxCalculator() {
  const [fromCountry, setFromCountry] = useState('US')
  const [toCountry, setToCountry] = useState('PT')
  const [amount, setAmount] = useState(100000)
  const [savings, setSavings] = useState(0)
  const [currentTax, setCurrentTax] = useState(0)
  const [newTax, setNewTax] = useState(0)

  useEffect(() => {
    const from = COUNTRIES.find(c => c.code === fromCountry)
    const to = COUNTRIES.find(c => c.code === toCountry)

    if (from && to) {
      const taxFrom = amount * from.cgtRate
      const taxTo = amount * to.cgtRate
      const saved = taxFrom - taxTo

      setCurrentTax(taxFrom)
      setNewTax(taxTo)
      setSavings(Math.max(0, saved))
    }
  }, [fromCountry, toCountry, amount])

  const fromData = COUNTRIES.find(c => c.code === fromCountry)
  const toData = COUNTRIES.find(c => c.code === toCountry)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Calculate Your Potential Savings
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            See how much you could save by optimizing your tax residency
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
          {/* From Country */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Country
            </label>
            <select
              value={fromCountry}
              onChange={(e) => setFromCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Country */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Target Country
            </label>
            <select
              value={toCountry}
              onChange={(e) => setToCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Crypto Gains (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="0"
              step="1000"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="100000"
            />
          </div>
        </div>

        {/* Results */}
        {savings > 0 ? (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Potential Annual Savings
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">
                <AnimatedCounter
                  value={savings}
                  prefix="$"
                  decimals={0}
                  duration={1500}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {fromData?.flag} Current: ${currentTax.toLocaleString()} → {toData?.flag} New: ${newTax.toLocaleString()}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
              Get Full Report
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {savings === 0 && fromCountry === toCountry
                ? 'Select different countries to see potential savings'
                : 'Your current country already has favorable tax rates!'}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          ⚠️ Estimates for illustration only. Consult a tax professional for personalized advice.
        </p>
      </div>
    </div>
  )
}
