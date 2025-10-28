import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tax Dashboard - Unified Crypto Tax Management | CryptoNomadHub',
  description: 'Centralized dashboard to manage all your crypto tax activities: portfolio overview, recent audits, tax simulations, AI recommendations, and quick access to all tools in one place.',
  keywords: [
    'crypto tax dashboard',
    'tax management dashboard',
    'crypto tax overview',
    'unified crypto tax',
    'crypto tax center',
    'portfolio tax dashboard',
    'crypto tax management',
    'tax activity tracking',
    'crypto tax tools dashboard',
    'tax reporting dashboard',
    'crypto tax hub',
    'centralized crypto tax',
    'tax management platform',
    'crypto tax software'
  ],
  openGraph: {
    title: 'Tax Dashboard - Manage All Your Crypto Tax Activities',
    description: 'Centralized dashboard for portfolio overview, audits, simulations, and AI recommendations.',
    url: 'https://cryptonomadhub.io/features/dashboard',
    type: 'website',
    images: [
      {
        url: '/og-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'CryptoNomadHub Tax Dashboard - Unified Management'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tax Dashboard - Manage All Your Crypto Tax Activities',
    description: 'Centralized dashboard for all crypto tax management in one place.',
    images: ['/og-dashboard.png'],
    creator: '@CryptoNomadHub'
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/features/dashboard'
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
