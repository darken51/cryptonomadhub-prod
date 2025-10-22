/**
 * Currency Display Component
 *
 * Smart component for displaying monetary amounts with multi-currency support.
 * Automatically shows local currency when available, USD otherwise.
 */

import React from 'react'
import { formatCurrency, formatDualCurrency, formatSmartCurrency, CurrencyData } from '@/lib/currency'

interface CurrencyDisplayProps {
  amountUsd: number
  amountLocal?: number | null
  currencyData?: CurrencyData
  /**
   * Display mode:
   * - "usd-only": Show USD only
   * - "dual": Show USD (Local) or just USD if no local
   * - "smart": Show Local (USD) if available, otherwise USD only
   * - "local-only": Show local currency only, fallback to USD
   */
  mode?: "usd-only" | "dual" | "smart" | "local-only"
  className?: string
  /**
   * Show + sign for positive numbers
   */
  showPlusSign?: boolean
}

export function CurrencyDisplay({
  amountUsd,
  amountLocal,
  currencyData,
  mode = "smart",
  className = "",
  showPlusSign = false
}: CurrencyDisplayProps) {
  let formatted: string

  switch (mode) {
    case "usd-only":
      formatted = formatCurrency(amountUsd, "$")
      break
    case "dual":
      formatted = formatDualCurrency(amountUsd, amountLocal, currencyData)
      break
    case "local-only":
      if (amountLocal && currencyData?.currency_symbol) {
        formatted = formatCurrency(amountLocal, currencyData.currency_symbol)
      } else {
        formatted = formatCurrency(amountUsd, "$")
      }
      break
    case "smart":
    default:
      formatted = formatSmartCurrency(amountUsd, amountLocal, currencyData)
  }

  // Add plus sign for positive numbers if requested
  if (showPlusSign && amountUsd > 0 && !formatted.startsWith("-")) {
    formatted = "+" + formatted
  }

  return <span className={className}>{formatted}</span>
}

/**
 * Currency Badge Component
 *
 * Shows currency code with flag or symbol in a badge
 */
interface CurrencyBadgeProps {
  currencyCode?: string | null
  currencySymbol?: string | null
  className?: string
}

export function CurrencyBadge({ currencyCode, currencySymbol, className = "" }: CurrencyBadgeProps) {
  if (!currencyCode) {
    return null
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 ${className}`}>
      <span>{currencySymbol || currencyCode}</span>
      <span className="text-slate-500 dark:text-slate-400">{currencyCode}</span>
    </span>
  )
}

/**
 * Exchange Rate Display Component
 *
 * Shows the current exchange rate used for conversions
 */
interface ExchangeRateDisplayProps {
  fromCurrency?: string
  toCurrency?: string
  rate?: number | null
  className?: string
}

export function ExchangeRateDisplay({
  fromCurrency = "USD",
  toCurrency,
  rate,
  className = ""
}: ExchangeRateDisplayProps) {
  if (!toCurrency || !rate || toCurrency === "USD") {
    return null
  }

  return (
    <div className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
    </div>
  )
}
