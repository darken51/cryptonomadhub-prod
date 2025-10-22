'use client'

import Link from 'next/link'
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function AIScoringDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold rounded-full mb-4">
              Core Concepts
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Understanding AI Country Scoring
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Learn how we score 163 countries on crypto tax rates and nomad quality of life.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>8 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What is AI Country Scoring?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              CryptoNomadHub's AI Country Scoring is a <strong>unique dual-scoring system</strong> that evaluates each of the 163 countries on two critical dimensions:
            </p>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Crypto Score</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 m-0">
                  Tax rates, legal status, regulations, reporting requirements, and crypto-friendliness
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white m-0">Nomad Score</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 m-0">
                  Cost of living, visa accessibility, infrastructure, expat community, and quality of life
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">The Overall Score Formula</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              The <strong>Overall AI Score (0-100)</strong> is calculated using a weighted average:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6 text-center">
              <code className="text-2xl font-bold text-slate-900 dark:text-white">
                Overall Score = (Crypto Score × 60%) + (Nomad Score × 40%)
              </code>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              <strong>Why 60/40?</strong> Crypto tax optimization is the primary goal (60%), but quality of life matters for long-term residency decisions (40%).
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Crypto Score (0-100): What We Evaluate</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our AI analyzes 7 key factors for the Crypto Score:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Capital Gains Tax Rate (40% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  0% = 100 points | 10% = 75 points | 20% = 50 points | 30% = 25 points | 40%+ = 0 points
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Legal Status (15% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Legal & Regulated = 100 points | Legal but Unregulated = 70 points | Restricted = 30 points | Banned = 0 points
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Reporting Requirements (10% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  No reporting = 100 points | Annual reporting = 70 points | Quarterly = 40 points | Monthly = 0 points
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Income Tax on Crypto (15% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Evaluates whether crypto is treated as income (staking, mining, airdrops) and the applicable tax rate
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Tax Treaties (10% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Number of active tax treaties to avoid double taxation
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Wealth/Exit Taxes (5% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Penalties for having wealth tax, inheritance tax, or exit tax on crypto
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">7. Regulatory Clarity (5% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Clear regulations = 100 points | Ambiguous = 50 points | No guidance = 0 points
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Nomad Score (0-100): What We Evaluate</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our AI analyzes 8 quality-of-life factors for the Nomad Score:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Cost of Living (25% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Housing, food, transportation, healthcare costs relative to quality of life
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Visa Accessibility (20% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Ease of obtaining visas, digital nomad visa availability, residency pathways
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Infrastructure (15% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Internet speed, coworking spaces, public transport, airports
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Expat Community Size (15% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Number of expats, networking opportunities, social infrastructure
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. English Proficiency (10% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Percentage of population speaking English, ease of daily communication
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Healthcare Quality (10% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Healthcare system ranking, private healthcare availability, costs
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">7. Safety (3% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Crime rates, political stability, personal safety for expats
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">8. Climate & Geography (2% weight)</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Weather, natural disasters, air quality, geographical appeal
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Real-World Examples</h2>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇸🇬 Singapore</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Crypto Score:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">95/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Nomad Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">72/100</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-300 dark:border-emerald-700">
                    <span className="font-bold text-slate-900 dark:text-white">Overall:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">86/100</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-emerald-300 dark:border-emerald-700">
                    Excellent crypto tax (0%) but high cost of living lowers nomad score
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇵🇹 Portugal</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Crypto Score:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">85/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Nomad Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">92/100</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300 dark:border-blue-700">
                    <span className="font-bold text-slate-900 dark:text-white">Overall:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">88/100</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                    Great balance: 0% crypto tax + excellent quality of life for nomads
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇦🇪 UAE (Dubai)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Crypto Score:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">98/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Nomad Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">68/100</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-amber-300 dark:border-amber-700">
                    <span className="font-bold text-slate-900 dark:text-white">Overall:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">86/100</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                    0% tax + crypto-friendly but high costs and visa requirements
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">🇩🇪 Germany</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Crypto Score:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">62/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Nomad Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">88/100</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-rose-300 dark:border-rose-700">
                    <span className="font-bold text-slate-900 dark:text-white">Overall:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">72/100</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-rose-300 dark:border-rose-700">
                    Excellent QoL but 26% crypto tax hurts overall score
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">How to Use AI Scores</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Use the AI Country Scores to:
            </p>
            <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-3 mb-6">
              <li><strong>Compare countries side-by-side</strong> - Use the Multi-Country Compare feature to see 2-5 countries with identical scoring</li>
              <li><strong>Filter by priorities</strong> - Sort by Crypto Score if tax is your priority, or Nomad Score if lifestyle matters more</li>
              <li><strong>Find hidden gems</strong> - Discover countries with high overall scores that you hadn't considered (Cyprus, Malta, Panama)</li>
              <li><strong>Make data-driven decisions</strong> - Don't just chase 0% tax - consider the full picture with nomad quality of life</li>
            </ol>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Explore AI Country Scores</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                View all 163 countries with AI scores on our interactive world map.
              </p>
              <Link
                href="/countries"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Explore 163 Countries
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
