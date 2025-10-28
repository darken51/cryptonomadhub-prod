import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Chat Assistant - Crypto Tax Expert for 167 Countries | CryptoNomadHub',
  description: 'AI-powered crypto tax chat assistant that analyzes your portfolio data across 167 countries. Get personalized tax advice, country comparisons, and optimization strategies based on your actual holdings and transactions.',
  keywords: [
    'crypto tax AI',
    'AI tax assistant',
    'crypto tax chat',
    'portfolio tax analysis',
    'crypto tax advisor',
    'AI crypto tax',
    'tax optimization AI',
    'crypto tax bot',
    'digital nomad tax AI',
    'multi-country tax AI',
    'cryptocurrency tax assistant',
    'blockchain tax AI',
    'DeFi tax chat',
    'crypto tax automation'
  ],
  openGraph: {
    title: 'AI Chat Assistant - Your Personal Crypto Tax Expert',
    description: 'AI analyzes your portfolio and provides personalized tax recommendations across 167 countries. Context-aware, multi-country expertise.',
    url: 'https://cryptonomadhub.io/features/ai-chat',
    type: 'website',
    images: [
      {
        url: '/og-ai-chat.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub AI Chat Assistant - Portfolio Analysis & Tax Optimization'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat Assistant - Your Personal Crypto Tax Expert',
    description: 'AI analyzes your portfolio for personalized tax recommendations across 167 countries.',
    images: ['/og-ai-chat.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/ai-chat'
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

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
