import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crypto Tax Blog | Expert Guides & Country Comparisons',
  description: 'Latest crypto tax news, strategies, and guides for digital nomads. Country comparisons, DeFi tax guides, tax loss harvesting, wash sale rules, and regulatory updates.',
  keywords: [
    'crypto tax blog',
    'crypto tax news',
    'tax loss harvesting guide',
    'DeFi tax guide',
    'Solana tax guide',
    'country tax comparison',
    'Portugal crypto tax news',
    'Germany crypto tax',
    'wash sale crypto',
    'IRS crypto rules'
  ],
  openGraph: {
    title: 'Crypto Tax Blog | Expert Guides for Digital Nomads',
    description: 'Tax strategies, country comparisons, DeFi guides, and the latest crypto tax news.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoNomadHub Blog',
    description: 'Expert crypto tax guides • Country comparisons • DeFi strategies • Regulatory news',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
