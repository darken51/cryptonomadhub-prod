import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tax Optimizer - Minimize Crypto Taxes Across 167 Countries | CryptoNomadHub',
  description: 'AI-powered tax optimization engine analyzes your portfolio and recommends the best countries for relocation. Save thousands in crypto taxes with personalized residency planning across 167 jurisdictions.',
  keywords: [
    'crypto tax optimizer',
    'AI tax optimization',
    'crypto tax minimization',
    'tax residency planning',
    'crypto tax relocation',
    'digital nomad tax planning',
    'crypto tax savings',
    'tax optimization AI',
    'best country for crypto tax',
    'crypto tax strategy',
    'international tax planning',
    'crypto tax haven',
    '0% crypto tax countries',
    'tax relocation optimizer'
  ],
  openGraph: {
    title: 'AI Tax Optimizer - Minimize Your Crypto Taxes Globally',
    description: 'AI recommends the best countries for your crypto tax situation. Save thousands with personalized relocation strategies.',
    url: 'https://cryptonomadhub.io/features/tax-optimizer',
    type: 'website',
    images: [
      {
        url: '/og-tax-optimizer.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Tax Optimizer - AI-Powered Tax Minimization'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tax Optimizer - Minimize Your Crypto Taxes Globally',
    description: 'AI recommends the best countries for your crypto tax situation across 167 jurisdictions.',
    images: ['/og-tax-optimizer.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/tax-optimizer'
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

export default function TaxOptimizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
