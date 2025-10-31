import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import SkipToContent from '@/components/SkipToContent'
import ErrorBoundary from '@/components/ErrorBoundary'
import { CookieConsent } from '@/components/CookieConsent'
import { MainContentWrapper } from '@/components/MainContentWrapper'

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
        url: '/og-homepage.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub - 167 Countries Analyzed, 43 with 0% Tax, $127k Avg Savings',
      }
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoNomadHub - 167 Countries Crypto Tax Database',
    description: 'Find 0% crypto tax countries. AI-powered analysis of tax regulations across 167 jurisdictions.',
    images: ['/og-homepage.png'],
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
  // Schema.org Organization markup for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CryptoNomadHub",
    "url": "https://cryptonomadhub.io",
    "logo": "https://cryptonomadhub.io/logo.svg",
    "description": "AI-powered crypto tax optimization across 167 countries. Find 0% tax jurisdictions, compare regulations, audit DeFi transactions.",
    "sameAs": [
      "https://twitter.com/CryptoNomadHub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": "https://cryptonomadhub.io/contact"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Schema.org Organization markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Plausible Analytics - Privacy-friendly analytics */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={inter.className}>
        {/* ✅ PHASE 2.4: Accessibility improvements */}
        <SkipToContent />
        {/* ✅ PHASE 2.5: Error boundary for error handling */}
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <AnalyticsProvider>
                <MainContentWrapper>
                  {children}
                </MainContentWrapper>
              </AnalyticsProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
        {/* ✅ GDPR Cookie Consent Banner */}
        <CookieConsent />
      </body>
    </html>
  )
}
