'use client'

import { HelpCircle, ExternalLink } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface EducationalTooltipProps {
  term: string
  definition: string
  learnMoreUrl?: string
  className?: string
}

export function EducationalTooltip({
  term,
  definition,
  learnMoreUrl,
  className = ''
}: EducationalTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-violet-100 transition-all cursor-help ${className}`}
          >
            {term}
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4 space-y-3 bg-white dark:bg-slate-900 border-2 border-violet-200 dark:border-violet-800 shadow-xl">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-violet-900 dark:text-violet-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {term}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {definition}
            </p>
          </div>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors"
            >
              Learn more
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Pre-configured tooltips for common tax terms
export const WashSaleTooltip = () => (
  <EducationalTooltip
    term="wash sale rule"
    definition="A tax rule that prevents you from claiming a capital loss deduction if you purchase the same or substantially identical asset within 30 days before or after selling it at a loss. This rule primarily applies in the US."
    learnMoreUrl="https://www.irs.gov/publications/p550#en_US_2022_publink1000257379"
  />
)

export const HoldingPeriodTooltip = () => (
  <EducationalTooltip
    term="holding period"
    definition="The length of time you must hold an asset to qualify for long-term capital gains tax rates, which are typically lower than short-term rates. In the US, this is 365 days; other jurisdictions may have different requirements."
    learnMoreUrl="https://www.investopedia.com/terms/h/holdingperiod.asp"
  />
)

export const TaxLossHarvestingTooltip = () => (
  <EducationalTooltip
    term="tax loss harvesting"
    definition="A tax strategy where you sell assets at a loss to offset capital gains, reducing your overall tax liability. The loss can offset gains from the same year and potentially carry forward to future years."
    learnMoreUrl="https://www.investopedia.com/terms/t/taxgainlossharvesting.asp"
  />
)

export const CapitalGainsTooltip = () => (
  <EducationalTooltip
    term="capital gains"
    definition="The profit you make when selling an asset for more than you paid for it. Capital gains are typically categorized as short-term (held less than the holding period) or long-term (held longer), with different tax rates applied to each."
    learnMoreUrl="https://www.investopedia.com/terms/c/capitalgain.asp"
  />
)
