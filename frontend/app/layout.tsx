import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SkipToContent from '@/components/SkipToContent'
import { CookieConsent } from '@/components/CookieConsent'
import { ClientProviders } from '@/components/ClientProviders'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true, // Preload font for faster rendering
})

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
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <link rel="preconnect" href="https://plausible.io" />
        )}
        <link rel="dns-prefetch" href="https://vercel.live" />

        {/* Schema.org Organization markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Plausible Analytics - Privacy-friendly analytics */}
        <script
          async
          src="https://plausible.io/js/pa-6-YkoRqckGmDdp8BgueM_.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`
          }}
        />
      </head>
      <body className={inter.className}>
        {/* ✅ PHASE 2.4: Accessibility improvements */}
        <SkipToContent />
        {/* ✅ Server-rendered semantic main tag for SEO */}
        <main id="main-content" className="flex-1">
          {/* ✅ Client providers wrapper - allows SSR for page content */}
          <ClientProviders>
            {children}
          </ClientProviders>
        </main>
        {/* ✅ GDPR Cookie Consent Banner */}
        <CookieConsent />
      </body>
    </html>
  )
}
