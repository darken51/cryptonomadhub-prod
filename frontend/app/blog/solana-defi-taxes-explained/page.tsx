import { PublicPageSSR } from '@/components/PublicPageSSR'
import SolanadefitaxesexplainedClient from './SolanadefitaxesexplainedClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Solana DeFi Taxes Explained - CryptoNomadHub Blog',
  description: 'Solana DeFi Taxes Explained - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <SolanadefitaxesexplainedClient />
    </PublicPageSSR>
  )
}
