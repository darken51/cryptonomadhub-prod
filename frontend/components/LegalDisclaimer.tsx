'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface LegalDisclaimerProps {
  variant?: 'compact' | 'prominent' | 'modal'
  onAccept?: () => void
}

export function LegalDisclaimer({ variant = 'compact', onAccept }: LegalDisclaimerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed && variant !== 'modal') return null

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('disclaimer_acknowledged', 'true')
    }
  }

  const handleAccept = () => {
    handleDismiss()
    onAccept?.()
  }

  // Compact version (small banner)
  if (variant === 'compact') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900 dark:text-yellow-200">
              ⚠️ Not Financial or Legal Advice
            </p>
            <p className="text-yellow-800 dark:text-yellow-300 mt-1">
              This tool provides general information only. Consult licensed tax professionals before making decisions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Prominent version (large warning)
  if (variant === 'prominent') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center animate-pulse-warning">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
              ⚠️ IMPORTANT LEGAL DISCLAIMER
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold">
                This software is NOT financial, tax, or legal advice.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Information may contain errors or be outdated</li>
                <li>Tax laws change frequently and vary by jurisdiction</li>
                <li>AI suggestions are approximations, not guarantees</li>
                <li>You are responsible for your own tax compliance</li>
              </ul>
              <p className="font-semibold mt-3">
                Always consult licensed tax professionals (CPA, tax attorney) before making financial decisions.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                By using this service, you agree to our Terms of Service and acknowledge that we bear no liability for tax penalties, audits, or legal consequences resulting from use of this tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal version (requires explicit acceptance)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center animate-pulse-warning">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200">
            Legal Disclaimer
          </h2>
        </div>

        <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-6">
          <p className="font-semibold text-lg">
            This tool provides general information only and is NOT:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Financial advice</li>
            <li>Tax advice</li>
            <li>Legal advice</li>
            <li>A substitute for professional consultation</li>
          </ul>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              ⚠️ Important Warnings:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Information may be outdated or inaccurate</li>
              <li>Tax laws change frequently</li>
              <li>AI calculations are approximations</li>
              <li>You bear full responsibility for tax compliance</li>
            </ul>
          </div>

          <p className="font-semibold">
            Before making any financial decisions, consult licensed professionals:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Certified Public Accountant (CPA)</li>
            <li>Tax Attorney</li>
            <li>Licensed Financial Advisor</li>
          </ul>

          <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <p className="font-semibold">By clicking "I Accept", you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You have read and understood this disclaimer</li>
              <li>You have read and agree to our <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a></li>
              <li>You have read and agree to our <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a></li>
              <li>You understand this is NOT financial, tax, or legal advice</li>
              <li>You are solely responsible for your tax compliance</li>
              <li>CryptoNomadHub bears no liability for any tax penalties, audits, legal consequences, or financial losses</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            I Accept All Terms
          </button>
        </div>
      </div>
    </div>
  )
}
