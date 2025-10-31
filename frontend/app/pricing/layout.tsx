import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Crypto Tax Plans from $0/month',
  description: 'Transparent crypto tax optimization pricing. Free plan with 5 simulations, Starter ($20) for individuals, Pro ($50) for traders, Enterprise for teams. Cancel anytime.',
  keywords: [
    'crypto tax software pricing',
    'crypto tax calculator cost',
    'tax optimization pricing',
    'free crypto tax tool',
    'crypto tax subscription',
    'DeFi tax pricing',
    'tax software for crypto'
  ],
  openGraph: {
    title: 'Pricing | Crypto Tax Optimization Plans from $0',
    description: 'Free plan available. Paid plans from $20/month with AI chat, DeFi audits, and unlimited tax simulations.',
    images: ['/og-homepage.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoNomadHub Pricing',
    description: 'Free: 5 sims/month • Starter $20: 50 sims • Pro $50: 500 sims • Enterprise: Unlimited',
    images: ['/og-homepage.png'],
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
