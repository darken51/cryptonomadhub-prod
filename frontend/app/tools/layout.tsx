import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Crypto Debit Cards 2025 | USDT/USDC Visa/Mastercard',
  description: 'Compare top crypto cards: RedotPay (5M+ users), Kast (10% rewards), Ultimo (offshore). Physical & virtual Visa/Mastercard with USDT, USDC, BTC, ETH support. Global coverage in 167 countries.',
  keywords: [
    'crypto debit card',
    'USDT card',
    'USDC card',
    'bitcoin debit card',
    'crypto visa card',
    'RedotPay card',
    'Kast crypto card',
    'Ultimo card',
    'offshore crypto card',
    'crypto rewards card',
    'stablecoin card',
    'Palau digital residency'
  ],
  openGraph: {
    title: 'Best Crypto Debit Cards 2025 | RedotPay, Kast, Ultimo',
    description: 'Compare crypto cards with USDT/USDC support. Up to 10% rewards, global coverage, offshore banking options.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Crypto Debit Cards 2025',
    description: 'RedotPay (5M users) • Kast (10% rewards) • Ultimo (offshore) • Global USDT/USDC Visa/Mastercard',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://cryptonomadhub.io/tools',
  },
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
