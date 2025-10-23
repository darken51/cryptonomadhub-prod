import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import SkipToContent from '@/components/SkipToContent'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CryptoNomadHub - AI-Powered Crypto Tax Optimization',
  description: 'Multi-jurisdiction crypto tax optimization for digital nomads. NOT financial or legal advice.',
  keywords: 'crypto, tax, digital nomad, optimization, bitcoin, ethereum, DeFi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ PHASE 2.4: Accessibility improvements */}
        <SkipToContent />
        {/* ✅ PHASE 2.5: Error boundary for error handling */}
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
