import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cost Basis Tracking - FIFO, LIFO, HIFO & More',
  description: 'Track crypto cost basis with multiple methods: FIFO, LIFO, HIFO, Specific ID. Handle up to 50k transactions per year. Automated wash sale detection and IRS-compliant reporting for tax optimization.',
  keywords: [
    'crypto cost basis',
    'FIFO crypto',
    'LIFO crypto',
    'HIFO crypto',
    'cost basis tracking',
    'crypto cost basis methods',
    'wash sale detection',
    'crypto capital gains',
    'IRS crypto reporting',
    'crypto tax lot tracking',
    'specific identification crypto',
    'crypto accounting method',
    'cost basis calculator',
    'crypto tax tracking'
  ],
  openGraph: {
    title: 'Cost Basis Tracking - FIFO, LIFO, HIFO & Wash Sale Detection',
    description: 'Track crypto cost basis with multiple methods. Handle 50k+ transactions with automated wash sale detection.',
    url: 'https://cryptonomadhub.io/features/cost-basis',
    type: 'website',
    images: [
      {
        url: '/og-cost-basis.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Cost Basis Tracking - FIFO, LIFO, HIFO Methods'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost Basis Tracking - FIFO, LIFO, HIFO & Wash Sale Detection',
    description: 'Track crypto cost basis with multiple IRS-compliant methods. Automated wash sale detection.',
    images: ['/og-cost-basis.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/cost-basis'
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

export default function CostBasisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
