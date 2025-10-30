'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, Shield } from 'lucide-react'
import { PublicPageLayout } from '@/components/PublicPageLayout'

export default function ConnectWalletDoc() {
  return (
    <PublicPageLayout>

      <article className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 dark:text-indigo-400 hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-300 text-sm font-semibold rounded-full mb-4">
              Getting Started
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              How to Connect Your Wallet
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Step-by-step guide to connecting Ethereum, Solana, and other wallets to CryptoNomadHub.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span>5 min read</span>
              <span>•</span>
              <span>Last updated: January 2025</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">
                  Security First
                </h3>
                <p className="text-amber-800 dark:text-amber-200">
                  <strong>We NEVER ask for your private keys or seed phrases.</strong> CryptoNomadHub only requires your public wallet address to read blockchain data. Your funds remain completely secure in your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">What You'll Need</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <span className="text-slate-700 dark:text-slate-300">A CryptoNomadHub account (create one at /auth/register)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <span className="text-slate-700 dark:text-slate-300">Your wallet's public address (NOT private key)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <span className="text-slate-700 dark:text-slate-300">2-3 minutes to complete setup</span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 1: Navigate to Wallets Page</h2>
            <ol className="space-y-4 list-decimal list-inside text-slate-700 dark:text-slate-300">
              <li>Log in to your CryptoNomadHub account</li>
              <li>Click on <strong>"Wallets"</strong> in the sidebar or navigation menu</li>
              <li>You'll see the Wallets dashboard with an <strong>"Add Wallet"</strong> button</li>
            </ol>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 2: Choose Your Blockchain</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Click <strong>"Add Wallet"</strong> and select the blockchain network for your wallet:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Supported Networks (50+):</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Ethereum (ETH)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Solana (SOL)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  Polygon (MATIC)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Arbitrum
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Optimism
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Base
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Avalanche
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  BNB Chain
                </li>
              </ul>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">+ 42 more chains supported</p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 3: Enter Your Public Address</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Copy and paste your wallet's public address into the input field. Here's how to find it:
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">For Ethereum (MetaMask, Rainbow, Coinbase Wallet):</h3>
            <ol className="space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 mb-6">
              <li>Open your wallet app or browser extension</li>
              <li>Click on your account name at the top</li>
              <li>Click "Copy Address" or click the address to copy</li>
              <li>Address format: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm">0x1234...abcd</code> (42 characters)</li>
            </ol>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">For Solana (Phantom, Solflare):</h3>
            <ol className="space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 mb-6">
              <li>Open your Solana wallet</li>
              <li>Click on your wallet address or profile icon</li>
              <li>Click "Copy Address"</li>
              <li>Address format: <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm">ABC123...XYZ</code> (32-44 characters)</li>
            </ol>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 4: Give Your Wallet a Name (Optional)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Add a friendly name to identify this wallet later. Examples:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>"Main Ethereum Wallet"</li>
              <li>"Solana DeFi"</li>
              <li>"NFT Collection Wallet"</li>
              <li>"Trading Account"</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 5: Click "Add Wallet"</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Once you've entered your public address and (optionally) named your wallet, click <strong>"Add Wallet"</strong>.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              CryptoNomadHub will immediately begin:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>✅ Verifying the wallet address format</li>
              <li>✅ Scanning the blockchain for transactions</li>
              <li>✅ Detecting DeFi protocols automatically</li>
              <li>✅ Calculating your portfolio value</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Step 6: View Your Portfolio</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              After adding your wallet, you'll be redirected to the Wallets page where you can:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li>See your total portfolio value across all wallets</li>
              <li>View holdings breakdown by token</li>
              <li>Track historical performance with charts</li>
              <li>Run a DeFi Audit to analyze all transactions</li>
              <li>Calculate cost basis and tax implications</li>
            </ul>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Adding Multiple Wallets</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You can connect unlimited wallets across different blockchains:
            </p>
            <ol className="space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 mb-6">
              <li>Click <strong>"Add Wallet"</strong> again on the Wallets page</li>
              <li>Choose a different blockchain or add another wallet on the same chain</li>
              <li>Repeat steps 3-5</li>
            </ol>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              All wallets will be aggregated into a single portfolio view with combined statistics.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Troubleshooting</h2>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">❌ "Invalid address format"</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Solution:</strong> Make sure you've selected the correct blockchain network. Ethereum addresses start with "0x", Solana addresses don't. Double-check for typos or extra spaces.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">❌ "Wallet not found" or "No transactions"</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Solution:</strong> This is normal for brand new wallets with no transaction history. Make at least one transaction and try again. Blockchain data may take 5-10 minutes to sync.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">❌ "Wallet already connected"</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Solution:</strong> You've already added this wallet. Check your Wallets page to see all connected wallets.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Security Best Practices</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span><strong>NEVER share your private key or seed phrase</strong> with anyone, including CryptoNomadHub support</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span>Only connect public addresses (read-only access)</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span>Use a strong unique password for your CryptoNomadHub account</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span>Use hardware wallets (Ledger, Trezor) for storing large amounts</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">Next Steps</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Now that you've connected your wallet, you can:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2 mb-6">
              <li><Link href="/docs/first-defi-audit" className="text-blue-600 dark:text-indigo-400 hover:underline">Run your first DeFi Audit</Link></li>
              <li>Explore the <Link href="/countries" className="text-blue-600 dark:text-indigo-400 hover:underline">167-country tax database</Link></li>
              <li><Link href="/docs/cost-basis-methods" className="text-blue-600 dark:text-indigo-400 hover:underline">Choose a cost basis method</Link> (FIFO/LIFO/HIFO)</li>
              <li>Calculate potential tax savings with the Tax Optimizer</li>
            </ul>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Need Help?</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you're having trouble connecting your wallet, our support team is here to help.
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </article>

      </PublicPageLayout>
  )
}
