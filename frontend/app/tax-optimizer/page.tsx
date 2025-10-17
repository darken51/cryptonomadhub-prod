"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingDown, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle, Info, ArrowRight } from "lucide-react"
import { AppHeader } from "@/components/AppHeader"
import { Footer } from "@/components/Footer"

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
}

interface PortfolioAnalysis {
  total_opportunities: number
  potential_tax_savings: number
  opportunities: Opportunity[]
  portfolio_summary: {
    total_lots: number
    total_value_usd: number
    total_unrealized_gain_loss: number
  }
  recommendations: string[]
}

interface OptimalTiming {
  token: string
  chain: string
  current_price: number
  total_lots: number
  suggestions: {
    lot_id: number
    amount: number
    acquisition_date: string
    holding_days: number
    is_long_term: boolean
    days_to_long_term: number
    unrealized_gain_loss: number
    estimated_tax: number
    timing_recommendation: string
  }[]
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
  const [optimalTiming, setOptimalTiming] = useState<OptimalTiming | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedToken, setSelectedToken] = useState("")
  const [selectedChain, setSelectedChain] = useState("ethereum")
  const [timingLoading, setTimingLoading] = useState(false)

  useEffect(() => {
    analyzePortfolio()
  }, [])

  const analyzePortfolio = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/tax-optimizer/analyze`, {
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

  const getOptimalTiming = async () => {
    if (!selectedToken) {
      setError("Please enter a token symbol")
      return
    }

    setTimingLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${API_URL}/tax-optimizer/optimal-timing?token=${selectedToken}&chain=${selectedChain}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to get optimal timing")
      }

      const data = await response.json()
      setOptimalTiming(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setTimingLoading(false)
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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Portfolio Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                          {formatCurrency(portfolioAnalysis.portfolio_summary.total_value_usd)}
                        </div>
                        <DollarSign className="h-8 w-8 text-violet-600" />
                      </div>
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
                          {formatCurrency(portfolioAnalysis.portfolio_summary.total_unrealized_gain_loss)}
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
                          {formatCurrency(portfolioAnalysis.potential_tax_savings)}
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

              {/* Tabs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Tabs defaultValue="opportunities" className="space-y-4">
                  <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-violet-200 dark:border-violet-800">
                    <TabsTrigger
                      value="opportunities"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white"
                    >
                      All Opportunities ({portfolioAnalysis.total_opportunities})
                    </TabsTrigger>
                    <TabsTrigger
                      value="calculator"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white"
                    >
                      Timing Calculator
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="opportunities" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            Tax Optimization Opportunities
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
                                          variant={opp.risk_level === 'low' ? 'default' : opp.risk_level === 'medium' ? 'secondary' : 'destructive'}
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
                                            {formatCurrency(opp.unrealized_gain_loss)}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {opp.unrealized_gain_loss_percent.toFixed(1)}%
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Potential Savings</p>
                                          <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(opp.potential_savings)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Current Value</p>
                                          <p className="text-lg font-semibold">
                                            {formatCurrency(opp.current_value_usd)}
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

                                      <div className="flex gap-2 pt-2">
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                                        >
                                          Execute Strategy
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950"
                                        >
                                          Learn More
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
                  </TabsContent>

                  <TabsContent value="calculator" className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            Optimal Sell Timing Calculator
                          </CardTitle>
                          <CardDescription>
                            Calculate the best time to sell a specific token to minimize taxes
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="token">Token Symbol</Label>
                              <Input
                                id="token"
                                placeholder="ETH, BTC, etc."
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value.toUpperCase())}
                                className="border-violet-200 focus:border-violet-600 focus:ring-violet-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="chain">Chain</Label>
                              <Select value={selectedChain} onValueChange={setSelectedChain}>
                                <SelectTrigger id="chain" className="border-violet-200 focus:border-violet-600 focus:ring-violet-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ethereum">Ethereum</SelectItem>
                                  <SelectItem value="polygon">Polygon</SelectItem>
                                  <SelectItem value="bsc">BSC</SelectItem>
                                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                  <SelectItem value="optimism">Optimism</SelectItem>
                                  <SelectItem value="solana">Solana</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end">
                              <Button
                                onClick={getOptimalTiming}
                                disabled={timingLoading}
                                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                              >
                                {timingLoading ? "Calculating..." : "Calculate"}
                              </Button>
                            </div>
                          </div>

                          {optimalTiming && (
                            <motion.div
                              className="space-y-4 pt-4 border-t border-violet-100 dark:border-violet-900"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                            {optimalTiming.token} on {optimalTiming.chain}
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                            Current Price: {formatCurrency(optimalTiming.current_price)} • {optimalTiming.total_lots} lots
                                          </p>
                                        </div>
                                      </div>

                                      <motion.div
                                        className="space-y-3"
                                        variants={staggerContainer}
                                        initial="initial"
                                        animate="animate"
                                      >
                                        {optimalTiming.suggestions.map((suggestion, index) => (
                                          <motion.div
                                            key={suggestion.lot_id}
                                            variants={cardVariants}
                                            transition={{ delay: index * 0.1 }}
                                          >
                                            <Card className="border-violet-200 dark:border-violet-800 hover:shadow-md transition-shadow">
                                              <CardContent className="pt-6">
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Lot #{suggestion.lot_id}</p>
                                                    <p className="font-semibold">{suggestion.amount.toFixed(4)} tokens</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Acquisition</p>
                                                    <p className="text-sm">{formatDate(suggestion.acquisition_date)}</p>
                                                    <p className="text-xs text-muted-foreground">{suggestion.holding_days} days</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Status</p>
                                                    <Badge
                                                      variant={suggestion.is_long_term ? "default" : "secondary"}
                                                      className={suggestion.is_long_term ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : ''}
                                                    >
                                                      {suggestion.is_long_term ? "Long-term" : `${suggestion.days_to_long_term}d to LT`}
                                                    </Badge>
                                                  </div>
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Unrealized</p>
                                                    <p className={`font-semibold ${suggestion.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                      {formatCurrency(suggestion.unrealized_gain_loss)}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-sm text-muted-foreground">Est. Tax</p>
                                                    <p className="font-semibold">{formatCurrency(suggestion.estimated_tax)}</p>
                                                  </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-violet-100 dark:border-violet-900 flex items-center gap-2">
                                                  <ArrowRight className="h-4 w-4 text-violet-600" />
                                                  <p className="text-sm font-medium">{suggestion.timing_recommendation}</p>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          </motion.div>
                                        ))}
                                      </motion.div>
                                    </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </Tabs>
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

              {/* Tax Strategies Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Alert className="border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50/50 dark:bg-fuchsia-950/50">
                  <Info className="h-4 w-4 text-fuchsia-600" />
                  <AlertTitle className="text-fuchsia-900 dark:text-fuchsia-100">Tax Optimization Strategies</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li><strong>Loss Harvesting:</strong> Sell losing positions to offset capital gains</li>
                      <li><strong>Holding Period:</strong> Wait 365+ days for long-term capital gains rate (typically 20% vs 37%)</li>
                      <li><strong>Wash Sale Rule:</strong> Wait 30 days before repurchasing to avoid disallowed losses</li>
                      <li><strong>Timing:</strong> Consider selling high-priority losses before year-end for current tax year benefit</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
