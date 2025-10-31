import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Multi-Country Tax Comparison - Compare Crypto Taxes Side-by-Side',
  description: 'Compare crypto tax regulations across multiple countries simultaneously. Side-by-side analysis of tax rates, capital gains rules, DeFi treatment, and reporting requirements up to 10 jurisdictions at once.',
  keywords: [
    'crypto tax comparison',
    'compare crypto tax countries',
    'multi country crypto tax',
    'side by side tax comparison',
    'crypto tax rates comparison',
    'compare cryptocurrency tax',
    'international tax comparison',
    'crypto tax jurisdiction comparison',
    'compare tax regulations',
    'crypto tax calculator comparison',
    'country tax comparison tool',
    'crypto tax side by side',
    'tax regulation comparison',
    'global crypto tax comparison'
  ],
  openGraph: {
    title: 'Multi-Country Tax Comparison - Compare Up to 10 Jurisdictions',
    description: 'Compare crypto tax regulations across multiple countries side-by-side. Analyze rates, rules, and requirements simultaneously.',
    url: 'https://cryptonomadhub.io/features/multi-country-compare',
    type: 'website',
    images: [
      {
        url: '/og-multi-compare.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Multi-Country Comparison - Side-by-Side Tax Analysis'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Country Tax Comparison - Compare Up to 10 Jurisdictions',
    description: 'Compare crypto tax regulations across multiple countries side-by-side.',
    images: ['/og-multi-compare.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/multi-country-compare'
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

export default function MultiCountryCompareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
