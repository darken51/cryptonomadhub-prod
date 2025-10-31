import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wallet & Portfolio Tracker - Connect 15+ Wallets',
  description: 'Connect and track up to 15 wallets across Ethereum, Solana, Bitcoin, and more. Real-time portfolio tracking, 24h price sync, profit/loss analysis, and automated transaction history for tax reporting.',
  keywords: [
    'crypto wallet tracker',
    'portfolio tracker',
    'multi wallet tracking',
    'crypto portfolio manager',
    'wallet connection crypto',
    'ethereum wallet tracker',
    'solana wallet tracker',
    'bitcoin wallet tracker',
    'crypto portfolio tax',
    'wallet transaction history',
    'multi chain portfolio',
    'crypto holdings tracker',
    'wallet sync',
    'portfolio profit loss'
  ],
  openGraph: {
    title: 'Wallet & Portfolio Tracker - Track 15+ Multi-Chain Wallets',
    description: 'Connect wallets across Ethereum, Solana, Bitcoin. Real-time tracking, profit/loss analysis, and tax reporting.',
    url: 'https://cryptonomadhub.io/features/wallet-portfolio',
    type: 'website',
    images: [
      {
        url: '/og-wallet-portfolio.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Wallet & Portfolio Tracker - Multi-Chain Support'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wallet & Portfolio Tracker - Track 15+ Multi-Chain Wallets',
    description: 'Connect wallets across multiple chains. Real-time tracking and tax reporting.',
    images: ['/og-wallet-portfolio.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/wallet-portfolio'
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

export default function WalletPortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
