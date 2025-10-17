'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Menu, X, ChevronDown,
  Globe, MessageCircle, Activity, Calculator, DollarSign, RefreshCw,
  BookOpen, FileText, HelpCircle, Briefcase, Users, Building,
  TrendingUp, Shield, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MegaMenuItem {
  title: string
  description: string
  icon: any
  href: string
  badge?: string
}

interface MegaMenuSection {
  title?: string
  items: MegaMenuItem[]
}

const featuresMenu: MegaMenuSection[] = [
  {
    title: 'Core Features',
    items: [
      {
        title: '160+ Countries',
        description: 'Worldwide tax coverage with official data',
        icon: Globe,
        href: '/countries',
        badge: 'Popular'
      },
      {
        title: 'AI Tax Assistant',
        description: 'Conversational AI with transparency mode',
        icon: MessageCircle,
        href: '/chat'
      },
      {
        title: 'DeFi Audit',
        description: 'On-chain analysis across 40+ protocols',
        icon: Activity,
        href: '/defi-audit',
        badge: 'New'
      }
    ]
  },
  {
    title: 'Advanced Tools',
    items: [
      {
        title: 'Cost Basis Tracking',
        description: 'FIFO, LIFO, HIFO methods',
        icon: Calculator,
        href: '/cost-basis'
      },
      {
        title: 'Tax Optimizer',
        description: 'Loss harvesting & opportunities',
        icon: DollarSign,
        href: '/tax-optimizer'
      },
      {
        title: 'Exchange Sync',
        description: 'Binance, Coinbase, Kraken integration',
        icon: RefreshCw,
        href: '/wallets'
      }
    ]
  }
]

const solutionsMenu: MegaMenuSection[] = [
  {
    items: [
      {
        title: 'For Digital Nomads',
        description: 'Optimize taxes across 160+ countries',
        icon: Globe,
        href: '/solutions/nomads'
      },
      {
        title: 'For Crypto Traders',
        description: 'Professional portfolio tracking',
        icon: TrendingUp,
        href: '/solutions/traders'
      },
      {
        title: 'For Accountants',
        description: 'Client management & white-label',
        icon: Briefcase,
        href: '/solutions/accountants'
      }
    ]
  }
]

const resourcesMenu: MegaMenuSection[] = [
  {
    items: [
      {
        title: 'Documentation',
        description: 'Complete guides and API docs',
        icon: BookOpen,
        href: '/docs'
      },
      {
        title: 'Blog & Insights',
        description: 'Tax strategies and crypto news',
        icon: FileText,
        href: '/blog'
      },
      {
        title: 'Help Center',
        description: 'FAQs and support articles',
        icon: HelpCircle,
        href: '/help'
      }
    ]
  }
]

function MegaMenuDropdown({
  title,
  sections
}: {
  title: string
  sections: MegaMenuSection[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors py-2"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 pt-2"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 min-w-[600px]">
              <div className="grid grid-cols-2 gap-6">
                {sections.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    {section.title && (
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="group flex items-start gap-3 p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-5 h-5 text-violet-600 dark:text-fuchsia-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-fuchsia-400">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-violet-100 dark:bg-fuchsia-900/50 text-violet-700 dark:text-fuchsia-300 rounded">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:scale-105 transition-transform">
              CN
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">CryptoNomadHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <MegaMenuDropdown title="Features" sections={featuresMenu} />
            <MegaMenuDropdown title="Solutions" sections={solutionsMenu} />
            <MegaMenuDropdown title="Resources" sections={resourcesMenu} />

            <Link
              href="/pricing"
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Features Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Features
                </h3>
                <div className="space-y-1">
                  {featuresMenu.flatMap(section => section.items).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Solutions Section */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Solutions
                </h3>
                <div className="space-y-1">
                  {solutionsMenu.flatMap(section => section.items).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-fuchsia-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/pricing"
                  className="block p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/auth/login"
                  className="block w-full px-4 py-2 text-sm text-center font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full px-4 py-2 text-sm text-center font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg shadow-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
