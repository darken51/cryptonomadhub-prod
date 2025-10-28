import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Country Scoring - Rank Best Crypto Tax Jurisdictions | CryptoNomadHub',
  description: 'AI analyzes 167 countries across 15+ factors: tax rates, regulations, quality of life, visa requirements. Get personalized country rankings based on your portfolio and lifestyle preferences.',
  keywords: [
    'AI country scoring',
    'crypto country ranking',
    'best crypto countries',
    'crypto tax jurisdiction ranking',
    'AI tax analysis',
    'country comparison AI',
    'crypto friendly countries ranking',
    'digital nomad country ranking',
    'crypto relocation AI',
    'tax jurisdiction scoring',
    'country tax comparison AI',
    'crypto country analysis',
    'AI powered country selection',
    'best countries for crypto'
  ],
  openGraph: {
    title: 'AI Country Scoring - Find Your Best Crypto Tax Jurisdiction',
    description: 'AI ranks 167 countries based on tax rates, regulations, quality of life, and your personal situation.',
    url: 'https://cryptonomadhub.io/features/ai-scoring',
    type: 'website',
    images: [
      {
        url: '/og-ai-scoring.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub AI Country Scoring - Intelligent Jurisdiction Ranking'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Country Scoring - Find Your Best Crypto Tax Jurisdiction',
    description: 'AI ranks 167 countries based on 15+ factors tailored to your situation.',
    images: ['/og-ai-scoring.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/ai-scoring'
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

export default function AIScoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
