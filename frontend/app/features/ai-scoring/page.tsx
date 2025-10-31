import { PublicPageSSR } from '@/components/PublicPageSSR'
import AiScoringClient from './AiScoringClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Country Scoring - CryptoNomadHub',
  description: 'Dual AI scoring system: Crypto Score (tax rates, legal status) + Nomad Score (visa policy, cost of living). Auto-refreshed every 30 days.',
}

export default function AiScoringPage() {
  return (
    <PublicPageSSR>
      <AiScoringClient />
    </PublicPageSSR>
  )
}
