'use client'

import { AlertTriangle, Info, Scale } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

interface TaxDisclaimerProps {
  variant?: 'default' | 'compact' | 'detailed'
  jurisdiction?: string
  className?: string
}

export function TaxDisclaimer({
  variant = 'default',
  jurisdiction,
  className = ''
}: TaxDisclaimerProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Compact variant - single line
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-slate-500 dark:text-slate-400 text-center ${className}`}>
        ⚠️ For informational purposes only. Not tax advice. Consult a licensed tax professional.
      </p>
    )
  }

  // Detailed variant - full legal notice
  if (variant === 'detailed') {
    return (
      <Alert className={className}>
        <Scale className="h-4 w-4" />
        <AlertTitle className="text-base font-semibold">Important Legal Notice</AlertTitle>
        <AlertDescription className="mt-3 space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Tax Optimization Tool - Informational Only</h4>
            <p className="text-slate-600 dark:text-slate-400">
              This tool provides general tax information and estimates based on current tax laws and regulations
              {jurisdiction && ` for ${jurisdiction}`}. This information is for educational and planning purposes only.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              NOT Tax Advice
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>This is NOT professional tax advice.</strong> Tax laws are complex, vary by jurisdiction,
              and change frequently. The calculations and recommendations provided are estimates based on general rules
              and may not account for all factors specific to your situation.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Your Responsibility</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>You are solely responsible for your tax obligations and decisions</li>
              <li>Always consult with a licensed tax professional or CPA before making any financial decisions</li>
              <li>Verify all tax rates and rules with official government sources</li>
              <li>Keep accurate records of all cryptocurrency transactions</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">No Guarantees</h4>
            <p className="text-slate-600 dark:text-slate-400">
              We make no representations or warranties regarding the accuracy, completeness, or timeliness of the
              information provided. Tax calculations may contain errors or may not reflect recent law changes.
              Use this tool at your own risk.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last updated: {currentDate} | Sources: Tax regulations database, KPMG, Deloitte, Koinly
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Default variant - standard disclaimer
  return (
    <Alert variant="default" className={className}>
      <Info className="h-4 w-4" />
      <AlertTitle>Tax Information Disclaimer</AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-sm">
        <p>
          <strong>⚠️ This tool provides estimates for informational purposes only.</strong>
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Tax laws are complex and vary by jurisdiction. This is NOT professional tax advice.
          Always consult with a licensed tax professional or CPA before making any financial decisions
          based on this information. You are solely responsible for your tax obligations.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
          Data accuracy not guaranteed. Tax rates and rules may change. Last updated: {currentDate}
        </p>
      </AlertDescription>
    </Alert>
  )
}
