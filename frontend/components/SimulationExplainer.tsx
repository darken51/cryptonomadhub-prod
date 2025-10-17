'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Check, AlertCircle } from 'lucide-react'

interface SimulationExplanation {
  decision: string
  reasoning: string[]
  rules_applied: Array<{
    rule: string
    value: string
    source: string
  }>
  assumptions: string[]
  confidence: number
  sources: string[]
}

interface SimulationExplainerProps {
  explanation: SimulationExplanation
}

export function SimulationExplainer({ explanation }: SimulationExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Confidence color
  const confidenceColor =
    explanation.confidence >= 0.8
      ? 'text-green-600 dark:text-green-400'
      : explanation.confidence >= 0.6
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400'

  const confidenceLabel =
    explanation.confidence >= 0.8
      ? 'High Confidence'
      : explanation.confidence >= 0.6
      ? 'Medium Confidence'
      : 'Low Confidence'

  return (
    <div className="border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              🤖 Explain Decision Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See how this calculation was made
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${confidenceColor}`}>
            {confidenceLabel} ({Math.round(explanation.confidence * 100)}%)
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
          {/* Decision Summary */}
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Decision
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{explanation.decision}</p>
            </div>
          </div>

          {/* Step-by-step reasoning */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📋</span> Step-by-Step Reasoning
            </h4>
            <ol className="space-y-2">
              {explanation.reasoning.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                  <span className="flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Rules Applied */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📖</span> Tax Rules Applied
            </h4>
            <div className="space-y-3">
              {explanation.rules_applied.map((rule, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {rule.rule}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rule.value}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                      {rule.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          {explanation.assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                Assumptions Made
              </h4>
              <ul className="space-y-2">
                {explanation.assumptions.map((assumption, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                      •
                    </span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>🔗</span> Official Sources
            </h4>
            <ul className="space-y-2">
              {explanation.sources.map((source, index) => {
                // Check if source is a valid URL
                const isUrl = source.startsWith('http://') || source.startsWith('https://')

                return (
                  <li key={index}>
                    {isUrl ? (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                      >
                        <span className="truncate">{source}</span>
                        <span className="flex-shrink-0">↗</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{source}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 italic">(pending verification)</span>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Confidence explanation */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              About Confidence Score
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confidence is based on data freshness and completeness. A score below 70% indicates
              regulations may be outdated (&gt;90 days) or incomplete. Always verify with official
              sources before making decisions.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-200 font-semibold">
              ⚠️ This explanation is for educational purposes only. Consult a licensed tax
              professional before making decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
