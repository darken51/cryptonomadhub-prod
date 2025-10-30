'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, Key, Code, Shield } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function APIAuthenticationDoc() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold rounded-full mb-4">
              API
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              API Authentication & Rate Limits
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Learn how to authenticate with our API and understand rate limits for developers.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>6 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">API Overview</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              The CryptoNomadHub API allows developers to integrate crypto tax optimization into their applications. Access:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>167 country tax data and AI scores</li>
              <li>DeFi audit automation</li>
              <li>Portfolio tracking and analytics</li>
              <li>Cost basis calculations (FIFO/LIFO/HIFO)</li>
              <li>Wash sale detection</li>
              <li>Form 8949 generation</li>
            </ul>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-8">
              <p className="font-bold text-slate-900 dark:text-white mb-2">Base URL:</p>
              <code className="text-blue-600 dark:text-blue-400 text-lg">
                https://api.cryptonomadhub.com/v1
              </code>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Authentication Methods</h2>

            <div className="grid gap-6 not-prose my-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white m-0">API Keys</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>Recommended for server-side applications.</strong> Generate API keys from your dashboard.
                </p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Usage:</strong></p>
                  <code className="text-sm text-slate-900 dark:text-white">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white m-0">JWT Tokens</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  <strong>For frontend applications.</strong> Obtain JWT tokens via OAuth login flow.
                </p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Usage:</strong></p>
                  <code className="text-sm text-slate-900 dark:text-white">
                    Authorization: Bearer JWT_TOKEN
                  </code>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Getting Your API Key</h2>
            <ol className="space-y-3 list-decimal list-inside text-slate-700 dark:text-slate-300 mb-6">
              <li>Log in to your CryptoNomadHub account</li>
              <li>Navigate to <strong>Settings → API Keys</strong></li>
              <li>Click <strong>"Generate New API Key"</strong></li>
              <li>Give your key a name (e.g., "Production App", "Development")</li>
              <li>Copy and securely store the API key (it won't be shown again)</li>
            </ol>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 my-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">🔐 Security Best Practices</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                <li>• Never commit API keys to version control (use environment variables)</li>
                <li>• Rotate keys every 90 days for production applications</li>
                <li>• Use separate keys for development, staging, and production</li>
                <li>• Revoke compromised keys immediately from Settings</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Making Your First Request</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Example: Get Country Tax Data</h3>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 my-6 overflow-x-auto">
              <pre className="text-sm text-emerald-400 font-mono">
{`curl -X GET "https://api.cryptonomadhub.com/v1/countries/PT" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Response:
{
  "country_code": "PT",
  "name": "Portugal",
  "crypto_tax_rate": 0,
  "income_tax_on_crypto": false,
  "legal_status": "legal",
  "ai_score": 88,
  "crypto_score": 85,
  "nomad_score": 92,
  "cost_of_living_index": 58,
  "residency_days": 183,
  "tax_treaties": 78
}`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Example: Start DeFi Audit</h3>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 my-6 overflow-x-auto">
              <pre className="text-sm text-emerald-400 font-mono">
{`curl -X POST "https://api.cryptonomadhub.com/v1/defi-audit" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "wallet_address": "0x1234...abcd",
    "blockchain": "ethereum"
  }'

# Response:
{
  "audit_id": "aud_abc123",
  "status": "processing",
  "wallet_address": "0x1234...abcd",
  "blockchain": "ethereum",
  "created_at": "2025-01-15T10:30:00Z"
}`}
              </pre>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Rate Limits</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              API rate limits are based on your subscription plan:
            </p>

            <div className="grid md:grid-cols-3 gap-4 not-prose my-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Free Tier</h3>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">requests per hour</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border-2 border-violet-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pro Plan</h3>
                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">1,000</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">requests per hour</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">10,000+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">custom limits</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Rate Limit Headers</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Every API response includes rate limit information in headers:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <pre className="text-sm text-slate-900 dark:text-white font-mono">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1705320000`}
              </pre>
            </div>

            <div className="space-y-3 text-slate-700 dark:text-slate-300 mb-6">
              <p><strong>X-RateLimit-Limit:</strong> Total requests allowed per hour</p>
              <p><strong>X-RateLimit-Remaining:</strong> Requests remaining in current window</p>
              <p><strong>X-RateLimit-Reset:</strong> Unix timestamp when limit resets</p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Handling Rate Limit Errors</h3>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 my-6 overflow-x-auto">
              <pre className="text-sm text-rose-400 font-mono">
{`# 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 15 minutes.",
  "retry_after": 900
}`}
              </pre>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              When you exceed rate limits, wait for the time specified in <code>retry_after</code> (seconds) before making more requests.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Available Endpoints</h2>

            <div className="space-y-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">GET</span>
                  <code className="text-sm text-slate-900 dark:text-white">/countries</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  List all 167 countries with tax data and AI scores
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">GET</span>
                  <code className="text-sm text-slate-900 dark:text-white">/countries/:code</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Get detailed tax information for a specific country
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">POST</span>
                  <code className="text-sm text-slate-900 dark:text-white">/defi-audit</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Start a DeFi audit for a wallet address
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">GET</span>
                  <code className="text-sm text-slate-900 dark:text-white">/defi-audit/:id</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Get audit status and results
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">GET</span>
                  <code className="text-sm text-slate-900 dark:text-white">/portfolio</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Get portfolio value and holdings across all wallets
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">POST</span>
                  <code className="text-sm text-slate-900 dark:text-white">/cost-basis</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Calculate cost basis with FIFO/LIFO/HIFO methods
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">GET</span>
                  <code className="text-sm text-slate-900 dark:text-white">/wash-sales</code>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Detect wash sale violations
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Error Codes</h2>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 my-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>200 OK:</strong> Request succeeded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>400 Bad Request:</strong> Invalid parameters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>401 Unauthorized:</strong> Invalid or missing API key</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>404 Not Found:</strong> Resource doesn't exist</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>429 Too Many Requests:</strong> Rate limit exceeded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300"><strong>500 Server Error:</strong> Internal server error</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Webhooks (Coming Soon)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Subscribe to real-time events via webhooks:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><code>audit.completed</code> - DeFi audit finished processing</li>
              <li><code>wash_sale.detected</code> - New wash sale violation detected</li>
              <li><code>portfolio.updated</code> - Portfolio value changed significantly</li>
              <li><code>country.tax_changed</code> - Country tax rate or regulations updated</li>
            </ul>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Need Enterprise API Access?</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Contact our team for custom rate limits, dedicated support, and white-label solutions.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Code className="w-5 h-5" />
                  Contact API Team
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 rounded-xl font-semibold hover:border-violet-600 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
