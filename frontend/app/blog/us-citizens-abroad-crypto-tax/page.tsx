import { PublicPageSSR } from '@/components/PublicPageSSR'
import UscitizensabroadcryptotaxClient from './UscitizensabroadcryptotaxClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'US Citizens Abroad Crypto Tax - CryptoNomadHub Blog',
  description: 'US Citizens Abroad Crypto Tax - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <UscitizensabroadcryptotaxClient />
    </PublicPageSSR>
  )
}
