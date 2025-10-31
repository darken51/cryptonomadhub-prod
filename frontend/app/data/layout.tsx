import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crypto Tax Data - 167 Countries Database',
  description: 'Open dataset of cryptocurrency tax regulations for 167 countries. Updated October 2025. Includes capital gains rates, holding periods, legal status, and AI-powered analysis. Available for research and AI training under CC-BY-4.0 license.',
  keywords: [
    'crypto tax data',
    'cryptocurrency tax database',
    'crypto tax rates by country',
    'crypto tax dataset',
    'open crypto tax data',
    'crypto tax API',
    'crypto regulation data',
    'crypto tax research',
    'crypto tax statistics',
    'global crypto tax',
    'crypto tax json',
    'crypto tax csv',
    'AI crypto tax data',
    'crypto tax training data'
  ],
  openGraph: {
    title: 'Crypto Tax Data - 167 Countries Open Dataset',
    description: 'Open dataset of cryptocurrency tax regulations for 167 countries. Updated October 2025. Available under CC-BY-4.0 license.',
    url: 'https://cryptonomadhub.io/data',
    type: 'website',
    images: [
      {
        url: '/og-data.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Open Crypto Tax Dataset - 167 Countries'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Tax Data - 167 Countries Open Dataset',
    description: 'Open dataset of crypto tax regulations for 167 countries. CC-BY-4.0 license.',
    images: ['/og-data.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/data',
    types: {
      'application/json': 'https://cryptonomadhub.io/tax-data.json'
    }
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

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
