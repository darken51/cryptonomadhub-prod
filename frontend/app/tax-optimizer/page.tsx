"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingDown, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Info, ArrowRight, HelpCircle } from "lucide-react"
import { AppHeader } from "@/components/AppHeader"
import { Footer } from "@/components/Footer"
import { JurisdictionSelector } from "@/components/JurisdictionSelector"
import { TaxDisclaimer } from "@/components/TaxDisclaimer"
import { AuditSelector } from "@/components/AuditSelector"
import {
  WashSaleTooltip,
  HoldingPeriodTooltip,
  TaxLossHarvestingTooltip
} from "@/components/EducationalTooltip"
import { CurrencyDisplay, CurrencyBadge, ExchangeRateDisplay } from "@/components/CurrencyDisplay"
import { parseCurrencyData } from "@/lib/currency"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Opportunity {
  id: number
  opportunity_type: string
  status: string
  token: string
  chain: string
  current_amount: number
  current_value_usd: number
  unrealized_gain_loss: number
  unrealized_gain_loss_percent: number
  potential_savings: number
  recommended_action: string
  action_description: string
  deadline: string | null
  confidence_score: number
  risk_level: string
  created_at: string
  // Multi-currency fields
  current_value_local?: number | null
  unrealized_gain_loss_local?: number | null
  potential_savings_local?: number | null
}

interface PortfolioAnalysis {
  total_opportunities: number
  potential_tax_savings: number
  opportunities: Opportunity[]
  portfolio_summary: {
    total_lots: number
    total_value_usd: number
    total_unrealized_gain_loss: number
    total_value_local?: number | null
    total_unrealized_gain_loss_local?: number | null
  }
  recommendations: string[]
  // Multi-currency fields
  local_currency?: string | null
  currency_symbol?: string | null
  potential_tax_savings_local?: number | null
  exchange_rate?: number | null
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

export default function TaxOptimizerPage() {
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Tax jurisdiction state
  const [taxJurisdiction, setTaxJurisdiction] = useState<string | null>(null)
  const [jurisdictionLoading, setJurisdictionLoading] = useState(true)

  // Audit selection state
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null)

  useEffect(() => {
    fetchTaxJurisdiction()
    analyzePortfolio()
  }, [])

  useEffect(() => {
    // Re-analyze when audit selection changes
    if (!jurisdictionLoading) {
      analyzePortfolio()
    }
  }, [selectedAuditId])

  const fetchTaxJurisdiction = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/cost-basis/settings`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTaxJurisdiction(data.tax_jurisdiction)
      }
    } catch (err) {
      console.error("Failed to fetch tax jurisdiction:", err)
    } finally {
      setJurisdictionLoading(false)
    }
  }

  const handleJurisdictionChange = (newJurisdiction: string) => {
    setTaxJurisdiction(newJurisdiction)
    // Refresh analysis with new jurisdiction
    analyzePortfolio()
  }

  const analyzePortfolio = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      // Build URL with audit_id parameter if audit is selected
      const url = selectedAuditId
        ? `${API_URL}/tax-optimizer/analyze?audit_id=${selectedAuditId}`
        : `${API_URL}/tax-optimizer/analyze`

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Tax optimizer error:", response.status, errorText)
        throw new Error(`Failed to analyze portfolio (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log("Tax optimizer response:", data)
      setPortfolioAnalysis(data)
    } catch (err) {
      console.error("Tax optimizer exception:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading && !portfolioAnalysis) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing your portfolio...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white dark:from-gray-900 dark:via-violet-950 dark:to-gray-900">
        {/* Hero Section */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-16"
          {...fadeInUp}
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Tax Optimizer
            </motion.h1>
            <motion.p
              className="text-xl text-violet-100 mb-6 max-w-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Maximize tax savings with intelligent loss harvesting and timing strategies
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <JurisdictionSelector
                currentJurisdiction={taxJurisdiction}
                onJurisdictionChange={handleJurisdictionChange}
                showBadgeOnly={true}
              />
            </motion.div>

            {/* Audit Selector */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6"
            >
              <AuditSelector
                selectedAuditId={selectedAuditId}
                onAuditChange={setSelectedAuditId}
              />
            </motion.div>

            {/* Jurisdiction Reminder */}
            {!taxJurisdiction && (
              <motion.div
                className="mb-6 p-4 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <strong className="font-semibold">Important:</strong> Please select your tax jurisdiction above to get accurate tax calculations and recommendations tailored to your country's tax laws.
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                onClick={analyzePortfolio}
                disabled={loading}
                className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? "Analyzing..." : "Refresh Analysis"}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="container mx-auto p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Empty Audit Warning */}
          {selectedAuditId && portfolioAnalysis && portfolioAnalysis.portfolio_summary.total_lots === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">
                  No Lots Found for This Audit
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <p className="mb-2">
                    This audit doesn't have any cost basis lots. This can happen when:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                    <li>The audit found 0 transactions (empty wallet during that period)</li>
                    <li>All transactions were outgoing (no acquisitions to track)</li>
                    <li>The audit was created before the auto-tracking feature was added</li>
                  </ul>
                  <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                    <p className="text-sm font-semibold mb-2">💡 Suggestions:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Select <strong>"All Portfolios"</strong> to analyze your entire portfolio (including manual entries)</li>
                      <li>• Create a new audit with an active wallet address</li>
                      <li>• Manually add cost basis lots in the Cost Basis page</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {portfolioAnalysis && (
            <>
              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={cardVariants}>
                  <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Total Portfolio Value
                        {portfolioAnalysis.local_currency && <CurrencyBadge currencyCode={portfolioAnalysis.local_currency} currencySymbol={portfolioAnalysis.currency_symbol} />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                          <CurrencyDisplay
                            amountUsd={portfolioAnalysis.portfolio_summary.total_value_usd}
                            amountLocal={portfolioAnalysis.portfolio_summary.total_value_local}
                            currencyData={parseCurrencyData(portfolioAnalysis)}
                            mode="dual"
                          />
                        </div>
                        <DollarSign className="h-8 w-8 text-violet-600" />
                      </div>
                      {portfolioAnalysis.exchange_rate && (
                        <div className="mt-2">
                          <ExchangeRateDisplay
                            fromCurrency="USD"
                            toCurrency={portfolioAnalysis.local_currency || undefined}
                            rate={portfolioAnalysis.exchange_rate}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Unrealized Gain/Loss
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${portfolioAnalysis.portfolio_summary.total_unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <CurrencyDisplay
                            amountUsd={portfolioAnalysis.portfolio_summary.total_unrealized_gain_loss}
                            amountLocal={portfolioAnalysis.portfolio_summary.total_unrealized_gain_loss_local}
                            currencyData={parseCurrencyData(portfolioAnalysis)}
                            mode="dual"
                            showPlusSign={true}
                          />
                        </div>
                        {portfolioAnalysis.portfolio_summary.total_unrealized_gain_loss >= 0 ? (
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Potential Tax Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          <CurrencyDisplay
                            amountUsd={portfolioAnalysis.potential_tax_savings}
                            amountLocal={portfolioAnalysis.potential_tax_savings_local}
                            currencyData={parseCurrencyData(portfolioAnalysis)}
                            mode="dual"
                          />
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                          {portfolioAnalysis.total_opportunities}
                        </div>
                        <CheckCircle className="h-8 w-8 text-fuchsia-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Tax Strategies Info - Educational tooltips BEFORE opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <Alert className="border-2 border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/50 shadow-lg">
                  <Info className="h-5 w-5 text-fuchsia-600" />
                  <AlertTitle className="text-fuchsia-900 dark:text-fuchsia-100 text-xl font-bold mb-3">
                    💡 Tax Optimization Strategies - Interactive Guide
                  </AlertTitle>
                  <AlertDescription className="text-fuchsia-800 dark:text-fuchsia-200">
                    <div className="mb-4 p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg border-2 border-violet-300 dark:border-violet-700">
                      <p className="text-sm font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 animate-pulse" />
                        Click on the violet badges below to see detailed explanations
                      </p>
                    </div>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 hover:shadow-md transition-shadow">
                        <span className="text-fuchsia-600 font-bold text-lg mt-0.5">•</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TaxLossHarvestingTooltip />
                            <span className="text-xs text-slate-500">← Click this badge</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">Sell losing positions to offset capital gains</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 hover:shadow-md transition-shadow">
                        <span className="text-fuchsia-600 font-bold text-lg mt-0.5">•</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <HoldingPeriodTooltip />
                            <span className="text-xs text-slate-500">← Click this badge</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">Wait 365+ days for long-term capital gains rate (typically 20% vs 37%)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 hover:shadow-md transition-shadow">
                        <span className="text-fuchsia-600 font-bold text-lg mt-0.5">•</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <WashSaleTooltip />
                            <span className="text-xs text-slate-500">← Click this badge</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-300">Wait 30 days before repurchasing to avoid disallowed losses (US only)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800">
                        <span className="text-fuchsia-600 font-bold text-lg mt-0.5">•</span>
                        <div className="flex-1">
                          <p className="text-slate-700 dark:text-slate-300"><strong className="text-fuchsia-900 dark:text-fuchsia-100">Timing:</strong> Consider selling high-priority losses before year-end for current tax year benefit</p>
                        </div>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* Tax Optimization Opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      Tax Optimization Opportunities ({portfolioAnalysis.total_opportunities})
                    </CardTitle>
                    <CardDescription>
                      Strategic tax planning to maximize savings and minimize liability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {portfolioAnalysis.opportunities.length === 0 ? (
                      <div className="text-center py-12">
                        <Info className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {portfolioAnalysis.recommendations[0] || "No optimization opportunities found"}
                        </p>
                        {portfolioAnalysis.recommendations.length > 1 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {portfolioAnalysis.recommendations[1]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="space-y-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {portfolioAnalysis.opportunities.map((opp, index) => (
                          <motion.div
                            key={opp.id}
                            variants={cardVariants}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border-l-4 hover:shadow-md transition-shadow" style={{
                              borderLeftColor: opp.opportunity_type === 'tax_loss_harvest' ? '#c026d3' : '#7c3aed'
                            }}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                      {opp.token} ({opp.chain})
                                    </CardTitle>
                                    <CardDescription>
                                      {opp.current_amount.toFixed(4)} tokens • {opp.opportunity_type.replace('_', ' ').toUpperCase()}
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    variant={opp.risk_level === 'low' ? 'success' : opp.risk_level === 'medium' ? 'warning' : 'danger'}
                                    className={opp.risk_level === 'low' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : ''}
                                  >
                                    {opp.risk_level.toUpperCase()}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Unrealized G/L</p>
                                    <p className={`text-lg font-semibold ${opp.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      <CurrencyDisplay
                                        amountUsd={opp.unrealized_gain_loss}
                                        amountLocal={opp.unrealized_gain_loss_local}
                                        currencyData={parseCurrencyData(portfolioAnalysis)}
                                        mode="dual"
                                        showPlusSign={true}
                                      />
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {opp.unrealized_gain_loss_percent.toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                                    <p className="text-lg font-semibold text-green-600">
                                      <CurrencyDisplay
                                        amountUsd={opp.potential_savings}
                                        amountLocal={opp.potential_savings_local}
                                        currencyData={parseCurrencyData(portfolioAnalysis)}
                                        mode="dual"
                                      />
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Current Value</p>
                                    <p className="text-lg font-semibold">
                                      <CurrencyDisplay
                                        amountUsd={opp.current_value_usd}
                                        amountLocal={opp.current_value_local}
                                        currencyData={parseCurrencyData(portfolioAnalysis)}
                                        mode="dual"
                                      />
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Confidence</p>
                                    <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                      {(opp.confidence_score * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-violet-100 dark:border-violet-900">
                                  <p className="text-sm text-muted-foreground mb-1">Recommended Action</p>
                                  <p className="text-sm font-medium">{opp.recommended_action}</p>
                                </div>

                                <div className="pt-2">
                                  <p className="text-sm text-muted-foreground mb-1">Details</p>
                                  <p className="text-sm">{opp.action_description}</p>
                                </div>

                                {opp.deadline && (
                                  <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-violet-600" />
                                    <span>Deadline: {formatDate(opp.deadline)}</span>
                                  </div>
                                )}

                                <div className="pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950 flex items-center justify-center gap-2"
                                    onClick={() => {
                                      const url = opp.opportunity_type === 'tax_loss_harvest'
                                        ? 'https://www.investopedia.com/terms/t/taxgainlossharvesting.asp'
                                        : opp.opportunity_type.includes('timing') || opp.opportunity_type.includes('holding')
                                        ? 'https://www.investopedia.com/terms/h/holdingperiod.asp'
                                        : 'https://www.investopedia.com/terms/c/capitalgain.asp'
                                      window.open(url, '_blank')
                                    }}
                                  >
                                    <Info className="w-4 h-4" />
                                    Learn More About This Strategy
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recommendations Alert */}
              {portfolioAnalysis.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Alert className="border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/50">
                    <Info className="h-4 w-4 text-violet-600" />
                    <AlertTitle className="text-violet-900 dark:text-violet-100">Recommendations</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {portfolioAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </>
          )}

          {/* Legal Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TaxDisclaimer variant="default" jurisdiction={taxJurisdiction || undefined} />
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
