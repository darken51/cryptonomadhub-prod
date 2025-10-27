import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import SkipToContent from '@/components/SkipToContent'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptonomadhub.io'),
  title: {
    default: 'CryptoNomadHub - 167 Countries Crypto Tax Database | 43 with 0% Tax',
    template: '%s | CryptoNomadHub'
  },
  description: 'AI-powered crypto tax optimization across 167 countries. Find 0% tax jurisdictions, compare regulations, audit DeFi transactions. Data from official government sources.',
  keywords: [
    'crypto tax',
    '0% crypto tax',
    'cryptocurrency tax',
    'bitcoin tax',
    'ethereum tax',
    'digital nomad tax',
    'crypto tax countries',
    'tax optimization',
    'DeFi tax',
    'Solana tax',
    'capital gains tax crypto',
    'tax-free countries',
    'UAE crypto tax',
    'Portugal crypto tax',
    'Singapore crypto tax',
    'Germany crypto tax',
    'crypto tax calculator',
    'IRS Form 8949',
    'wash sale crypto',
    'tax loss harvesting'
  ],
  authors: [{ name: 'CryptoNomadHub' }],
  creator: 'CryptoNomadHub',
  publisher: 'CryptoNomadHub',

  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cryptonomadhub.io',
    siteName: 'CryptoNomadHub',
    title: 'CryptoNomadHub - 167 Countries Crypto Tax Database',
    description: 'AI analyzes crypto tax regulations in 167 countries. Find 0% tax jurisdictions, compare rates, and optimize your tax strategy as a digital nomad.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub - 167 Countries Analyzed, 43 with 0% Crypto Tax',
      }
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoNomadHub - 167 Countries Crypto Tax Database',
    description: 'Find 0% crypto tax countries. AI-powered analysis of tax regulations across 167 jurisdictions.',
    images: ['/og-image.png'],
    creator: '@CryptoNomadHub',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical
  alternates: {
    canonical: 'https://cryptonomadhub.io',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
