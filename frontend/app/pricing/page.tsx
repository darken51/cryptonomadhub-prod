import { PublicPageSSR } from '@/components/PublicPageSSR'
import PricingClient from './PricingClient'
import { Metadata } from 'next'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing - CryptoNomadHub',
  description: 'Affordable pricing for crypto tax optimization. Free plan available. Starter at $15/mo, Pro at $39/mo. No hidden fees.',
}

export default function PricingPage() {
  return (
    <PublicPageSSR>
      <PricingClient />
    </PublicPageSSR>
  )
}
