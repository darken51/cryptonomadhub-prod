import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '167 Countries Crypto Tax Database - Compare Regulations Globally',
  description: 'Complete database of crypto tax regulations in 167 countries. AI-powered scoring, real-time updates, and detailed analysis from official government sources. Find 0% tax jurisdictions and compare worldwide.',
  keywords: [
    'crypto tax by country',
    'global crypto tax database',
    '167 countries crypto tax',
    'crypto tax comparison',
    'cryptocurrency regulations worldwide',
    'crypto tax rates by country',
    '0% crypto tax countries',
    'crypto tax haven',
    'international crypto tax',
    'crypto friendly countries',
    'global cryptocurrency tax',
    'country crypto tax comparison',
    'crypto tax regulations database',
    'worldwide crypto tax'
  ],
  openGraph: {
    title: '167 Countries Crypto Tax Database - Global Tax Comparison',
    description: 'AI-powered analysis of crypto tax regulations in 167 countries. Find 0% tax jurisdictions and compare worldwide.',
    url: 'https://cryptonomadhub.io/features/countries',
    type: 'website',
    images: [
      {
        url: '/og-countries.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub - 167 Countries Crypto Tax Database'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '167 Countries Crypto Tax Database - Global Tax Comparison',
    description: 'AI-powered analysis of crypto tax regulations in 167 countries with official government data.',
    images: ['/og-countries.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/countries'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
}

export default function CountriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
