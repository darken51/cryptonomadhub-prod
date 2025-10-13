import Link from 'next/link'
import { Footer } from '@/components/Footer'

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose the plan that fits your needs
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* FREE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">5 tax simulations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">20 AI chat messages/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Access to 98 countries data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-gray-500 dark:text-gray-500">No DeFi audits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-gray-500 dark:text-gray-500">No PDF exports</span>
                </li>
              </ul>

              <Link
                href="/auth/register"
                className="block w-full text-center py-2 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                Get Started
              </Link>
            </div>

            {/* STARTER */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Starter</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">POPULAR</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$20</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">50 tax simulations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">200 AI chat messages/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">5 DeFi audits/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">PDF report exports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Priority email support</span>
                </li>
              </ul>

              <Link
                href="/auth/register"
                className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* PRO */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-purple-500">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">BEST VALUE</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$50</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">500 tax simulations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">2000 AI chat messages/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">50 DeFi audits/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Unlimited PDF exports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                </li>
              </ul>

              <Link
                href="/auth/register"
                className="block w-full text-center py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-6 border-2 border-yellow-500">
              <h2 className="text-2xl font-bold text-white mb-2">Enterprise</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span className="text-gray-200">Unlimited everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span className="text-gray-200">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span className="text-gray-200">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span className="text-gray-200">SLA guarantees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span className="text-gray-200">API access</span>
                </li>
              </ul>

              <a
                href="mailto:sales@cryptonomadhub.com"
                className="block w-full text-center py-2 px-4 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition"
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can cancel your subscription at any time from your account settings. No questions asked.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We don't offer refunds for partial months, but you can cancel at any time to prevent future charges.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How does billing work?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Billing is monthly and automatic. All payments are processed securely through Paddle, our Merchant of Record.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What happens if I exceed my limits?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You'll be notified when you reach 80% of your monthly quota. If you exceed limits, you'll need to upgrade to continue using the service.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-16 max-w-4xl mx-auto p-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>⚠️ Disclaimer:</strong> NomadCrypto Hub is NOT financial, tax, or legal advice.
              All information provided is for educational purposes only. Consult with licensed tax professionals
              before making any financial decisions. See our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> for more details.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
