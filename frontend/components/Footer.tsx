import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              NomadCrypto Hub
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered crypto tax optimization for digital nomads across 98 countries.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/defi-audit" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  DeFi Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="mailto:legal@cryptonomadhub.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  legal@cryptonomadhub.com
                </a>
              </li>
              <li>
                <a href="mailto:privacy@cryptonomadhub.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  privacy@cryptonomadhub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} NomadCrypto Hub. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-right max-w-md">
              ⚠️ NOT financial, legal, or tax advice. Consult licensed professionals before making decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
