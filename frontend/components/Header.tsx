'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:scale-105 transition-transform">
              NC
            </div>
            <span className="text-lg font-bold text-fg">NomadCrypto Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/tools"
              className="text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors"
            >
              AI Chat
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/auth/login" className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg rounded-lg transition-all">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-fg-muted hover:text-fg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-slate-900">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/pricing"
              className="block text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/tools"
              className="block text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="/chat"
              className="block text-sm font-medium text-fg-muted hover:text-brand-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Chat
            </Link>
            <div className="pt-3 space-y-2">
              <Link href="/auth/login" className="block w-full px-3 py-1.5 text-sm text-center font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="block w-full px-3 py-1.5 text-sm text-center font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg rounded-lg transition-all">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
