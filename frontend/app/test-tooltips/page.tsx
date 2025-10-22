'use client'

import { TaxLossHarvestingTooltip, HoldingPeriodTooltip, WashSaleTooltip } from '@/components/EducationalTooltip'

export default function TestTooltipsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          🧪 Tooltip Test Page
        </h1>

        <div className="bg-fuchsia-50 dark:bg-fuchsia-950/50 border-2 border-fuchsia-300 dark:border-fuchsia-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-fuchsia-900 dark:text-fuchsia-100 mb-6">
            Tax Strategy Tooltips
          </h2>

          <div className="space-y-6 text-lg">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg">
              <span className="font-semibold">1.</span>
              <TaxLossHarvestingTooltip />
            </div>

            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg">
              <span className="font-semibold">2.</span>
              <HoldingPeriodTooltip />
            </div>

            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg">
              <span className="font-semibold">3.</span>
              <WashSaleTooltip />
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Instructions:</strong> You should see 3 violet badges above with the terms
              "tax loss harvesting", "holding period", and "wash sale rule".
              Click or hover over them to see detailed explanations.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/tax-optimizer"
            className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Back to Tax Optimizer
          </a>
        </div>
      </div>
    </div>
  )
}
