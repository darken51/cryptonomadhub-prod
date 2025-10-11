import Link from 'next/link'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NomadCrypto Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            AI-Powered Crypto Tax Optimization for Digital Nomads
          </p>
          <p className="text-sm text-gray-500">
            Compare tax scenarios across 50+ countries with AI-powered insights
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Login
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🌍 50+ Countries</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare tax rates across major jurisdictions with official 2025 data
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🤖 AI Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explain Decision mode shows step-by-step reasoning for transparency
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📊 DeFi Audits</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time portfolio analysis across chains (Ethereum, BSC, Polygon)
            </p>
          </div>
        </div>

        {/* Pricing Teaser */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Freemium pricing starts at $20/month • No credit card required for trial
          </p>
          <Link
            href="/pricing"
            className="text-blue-600 hover:underline font-semibold"
          >
            View Plans →
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <LegalDisclaimer variant="prominent" />
      </div>
    </main>
  )
}
