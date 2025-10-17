'use client'

import Link from 'next/link'
import { Globe, MessageCircle, Activity, FileText, CheckCircle2, Shield, TrendingUp } from 'lucide-react'
import { Header } from '@/components/Header'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-16 md:py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Hero Title */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Optimize Your Crypto Taxes
              <br />
              <span className="gradient-text">Globally</span>
            </h1>
            <p className="text-lg md:text-xl text-fg-muted max-w-2xl mx-auto">
              AI-powered tax simulations across <strong className="text-fg font-semibold">98 countries</strong> with instant DeFi audit
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/auth/register" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105 rounded-lg transition-all">
              Get Started Free →
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:shadow-lg hover:border-purple-600 rounded-lg transition-all">
              See Pricing
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-6 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-fg-muted">98 Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium text-fg-muted">10K+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-fg-muted">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Everything you need to optimize your crypto taxes
            </h2>
            <p className="text-base md:text-lg text-fg-muted">
              Powerful tools for digital nomads and crypto investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-fg mb-2">98 Countries</h3>
              <p className="text-sm text-fg-muted">
                Compare tax rates across major jurisdictions with official 2025 data
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-fg mb-2">AI Chat</h3>
              <p className="text-sm text-fg-muted">
                Conversational AI assistant with transparency mode
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all relative">
              <Badge variant="new" className="absolute top-3 right-3">NEW</Badge>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-fg mb-2">DeFi Audit</h3>
              <p className="text-sm text-fg-muted">
                Analyze on-chain activity across 40+ blockchains
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-fg mb-2">PDF Reports</h3>
              <p className="text-sm text-fg-muted">
                Export professional tax reports with full calculations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold">
            Start Optimizing Your Taxes Today
          </h3>
          <p className="text-base md:text-lg text-fg-muted">
            Plans starting at <strong className="text-fg font-semibold">$20/month</strong>
          </p>
          <p className="text-sm text-fg-muted">
            No credit card required • Cancel anytime
          </p>
          <div className="pt-2">
            <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105 rounded-lg transition-all">
              View All Plans →
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <LegalDisclaimer variant="prominent" />
        </div>
      </section>

      <Footer />
    </div>
  )
}
