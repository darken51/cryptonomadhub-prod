import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DeFi Audit Tool - Analyze Solana, Ethereum & Multi-Chain Transactions',
  description: 'Audit your DeFi transactions across Solana, Ethereum, and multiple blockchains. Automatic categorization of swaps, LP, staking, and lending. Generate tax-compliant PDF reports instantly.',
  keywords: [
    'DeFi audit',
    'crypto transaction audit',
    'Solana DeFi audit',
    'Ethereum DeFi audit',
    'blockchain transaction analyzer',
    'DeFi tax audit',
    'Jupiter audit',
    'Raydium audit',
    'Uniswap audit',
    'crypto audit tool',
    'DeFi transaction categorization',
    'multi-chain audit',
    'DeFi tax report',
    'blockchain audit'
  ],
  openGraph: {
    title: 'DeFi Audit Tool - Multi-Chain Transaction Analysis',
    description: 'Audit DeFi transactions across Solana, Ethereum, and more. Automatic categorization and tax-compliant PDF reports.',
    url: 'https://cryptonomadhub.io/features/defi-audit',
    type: 'website',
    images: [
      {
        url: '/og-defi-audit.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub DeFi Audit - Multi-Chain Transaction Analysis'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Audit Tool - Multi-Chain Transaction Analysis',
    description: 'Audit DeFi transactions across Solana, Ethereum, and more. Automatic categorization and tax reports.',
    images: ['/og-defi-audit.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/defi-audit'
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

export default function DeFiAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
