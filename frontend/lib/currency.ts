/**
 * Currency Formatting Utilities
 *
 * Helpers for displaying multi-currency values throughout the app.
 */

export interface CurrencyData {
  local_currency?: string | null
  currency_symbol?: string | null
  exchange_rate?: number | null
}

/**
 * Format amount with currency symbol
 *
 * @param amount Amount to format
 * @param currencySymbol Currency symbol (e.g., "$", "€", "£")
 * @param locale Locale for number formatting (default: "en-US")
 * @returns Formatted string (e.g., "$1,234.56", "€1.234,56")
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "$",
  locale: string = "en-US"
): string {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount))

  const sign = amount < 0 ? "-" : ""

  return `${sign}${currencySymbol}${formatted}`
}

/**
 * Format dual currency display (USD + Local)
 *
 * Shows: "$1,000 (€857)" or just "$1,000" if no local currency
 *
 * @param amountUsd Amount in USD
 * @param amountLocal Amount in local currency (optional)
 * @param currencyData Currency metadata
 * @returns Formatted string
 */
export function formatDualCurrency(
  amountUsd: number,
  amountLocal?: number | null,
  currencyData?: CurrencyData
): string {
  const usdFormatted = formatCurrency(amountUsd, "$")

  // If no local currency data or same as USD, show only USD
  if (!amountLocal || !currencyData?.currency_symbol || currencyData.local_currency === "USD") {
    return usdFormatted
  }

  const localFormatted = formatCurrency(amountLocal, currencyData.currency_symbol)
  return `${usdFormatted} (${localFormatted})`
}

/**
 * Format with smart currency preference
 *
 * Shows local currency first if available, USD in parentheses
 * Otherwise shows USD only
 *
 * @param amountUsd Amount in USD
 * @param amountLocal Amount in local currency (optional)
 * @param currencyData Currency metadata
 * @returns Formatted string
 */
export function formatSmartCurrency(
  amountUsd: number,
  amountLocal?: number | null,
  currencyData?: CurrencyData
): string {
  // If no local currency or USD jurisdiction, show USD only
  if (!amountLocal || !currencyData?.currency_symbol || currencyData.local_currency === "USD") {
    return formatCurrency(amountUsd, "$")
  }

  // Show local currency primary, USD secondary
  const localFormatted = formatCurrency(amountLocal, currencyData.currency_symbol)
  const usdFormatted = formatCurrency(amountUsd, "$")
  return `${localFormatted} (${usdFormatted})`
}

/**
 * Get currency symbol from currency code
 *
 * @param currencyCode ISO currency code (e.g., "EUR", "GBP", "USD")
 * @returns Currency symbol (e.g., "€", "£", "$")
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    CHF: "CHF",
    CAD: "C$",
    AUD: "A$",
    NZD: "NZ$",
    SGD: "S$",
    HKD: "HK$",
    INR: "₹",
    BRL: "R$",
    MXN: "MX$",
    ZAR: "R",
    KRW: "₩",
    RUB: "₽",
    TRY: "₺",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    THB: "฿",
    IDR: "Rp",
    MYR: "RM",
    PHP: "₱",
    AED: "د.إ",
    SAR: "﷼",
    ILS: "₪",
    CZK: "Kč",
    HUF: "Ft",
    RON: "lei",
    BGN: "лв",
  }

  return symbols[currencyCode] || currencyCode
}

/**
 * Format compact number (e.g., 1.2K, 3.5M)
 *
 * @param amount Amount to format
 * @param currencySymbol Currency symbol
 * @returns Compact formatted string
 */
export function formatCompactCurrency(amount: number, currencySymbol: string = "$"): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""

  if (absAmount >= 1_000_000) {
    return `${sign}${currencySymbol}${(absAmount / 1_000_000).toFixed(1)}M`
  } else if (absAmount >= 1_000) {
    return `${sign}${currencySymbol}${(absAmount / 1_000).toFixed(1)}K`
  } else {
    return `${sign}${currencySymbol}${absAmount.toFixed(0)}`
  }
}

/**
 * Parse currency data from API response
 *
 * @param data API response with currency fields
 * @returns CurrencyData object
 */
export function parseCurrencyData(data: any): CurrencyData {
  return {
    local_currency: data?.local_currency || null,
    currency_symbol: data?.currency_symbol || null,
    exchange_rate: data?.exchange_rate || null,
  }
}
