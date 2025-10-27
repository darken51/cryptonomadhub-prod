import Link from 'next/link'
import { Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                CN
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white">CryptoNomadHub</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Optimize your crypto taxes globally</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/countries" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Countries
              </Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Docs
              </Link>
              <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Blog
              </Link>
              <Link href="/help" className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Help
              </Link>
            </nav>

            {/* Contact */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:support@cryptonomadhub.io"
                className="p-2 text-slate-500 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
              <span>© {currentYear} CryptoNomadHub</span>
              <Link href="/terms" className="hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Privacy
              </Link>
              <Link href="/legal" className="hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Legal
              </Link>
              <a href="mailto:support@cryptonomadhub.io" className="hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors">
                Contact Support
              </a>
            </div>
            <p className="text-center md:text-right">
              ⚠️ Not financial or tax advice. Consult professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
