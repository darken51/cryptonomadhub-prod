'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Users, Award, AlertCircle, CheckCircle2, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface CountryAnalysis {
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
  generation_duration_ms?: number
}

interface CountryScoreCardProps {
  analysis: CountryAnalysis
  className?: string
  defaultExpanded?: boolean
}

export default function CountryScoreCard({ analysis, className = '', defaultExpanded = false }: CountryScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
    return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const ScoreBreakdownBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className={`font-bold ${getScoreColor(value)}`}>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getProgressColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  )

  return (
    <motion.div
      className={`bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border-2 border-violet-200 dark:border-violet-800 shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          AI Country Analysis
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-violet-600 text-white rounded-full font-medium">
            {Math.round(analysis.confidence * 100)}% confident
          </span>
        </div>
      </div>

      {/* Main Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Crypto Score */}
        <div className={`p-4 rounded-lg border-2 ${getScoreBg(analysis.crypto_score)}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Crypto Score</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.crypto_score)}`}>
            {analysis.crypto_score}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">/ 100</div>
        </div>

        {/* Nomad Score */}
        <div className={`p-4 rounded-lg border-2 ${getScoreBg(analysis.nomad_score)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nomad Score</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.nomad_score)}`}>
            {analysis.nomad_score}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">/ 100</div>
        </div>

        {/* Overall Score */}
        <div className={`p-4 rounded-lg border-2 ${getScoreBg(analysis.overall_score)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Overall</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
            {analysis.overall_score}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">/ 100</div>
        </div>
      </div>

      {/* Score Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Crypto Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
          <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-3">
            🪙 Crypto Ecosystem
          </h4>
          <div className="space-y-3">
            <ScoreBreakdownBar label="Tax Favorability" value={analysis.crypto_score_breakdown.tax_favorability} />
            <ScoreBreakdownBar label="Legal Clarity" value={analysis.crypto_score_breakdown.legal_clarity} />
            <ScoreBreakdownBar label="Crypto Adoption" value={analysis.crypto_score_breakdown.crypto_adoption} />
            <ScoreBreakdownBar label="Innovation Ecosystem" value={analysis.crypto_score_breakdown.innovation_ecosystem} />
          </div>
        </div>

        {/* Nomad Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-fuchsia-200 dark:border-fuchsia-800">
          <h4 className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300 mb-3">
            ✈️ Digital Nomad Lifestyle
          </h4>
          <div className="space-y-3">
            <ScoreBreakdownBar label="Cost of Living" value={analysis.nomad_score_breakdown.cost_of_living} />
            <ScoreBreakdownBar label="Visa Accessibility" value={analysis.nomad_score_breakdown.visa_accessibility} />
            <ScoreBreakdownBar label="Infrastructure" value={analysis.nomad_score_breakdown.infrastructure} />
            <ScoreBreakdownBar label="Expat Community" value={analysis.nomad_score_breakdown.expat_community} />
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 py-3 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Full Analysis
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View Full Analysis
          </>
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              {/* Analyses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
                  <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">
                    Crypto Analysis
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysis.crypto_analysis}
                  </p>
                </div>
                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg p-4 border border-fuchsia-200 dark:border-fuchsia-800">
                  <h4 className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300 mb-2">
                    Nomad Analysis
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysis.nomad_analysis}
                  </p>
                </div>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Advantages */}
                {analysis.key_advantages.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Advantages
                    </h4>
                    <ul className="space-y-2">
                      {analysis.key_advantages.map((advantage, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-green-800 dark:text-green-200">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disadvantages */}
                {analysis.key_disadvantages.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Key Disadvantages
                    </h4>
                    <ul className="space-y-2">
                      {analysis.key_disadvantages.map((disadvantage, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-red-800 dark:text-red-200">
                          <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                          <span>{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Best For */}
              {analysis.best_for.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Best For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.best_for.map((target, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full"
                      >
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400">
          <span>
            Updated {new Date(analysis.generated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
