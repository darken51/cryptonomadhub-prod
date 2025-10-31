import { PublicPageSSR } from '@/components/PublicPageSSR'
import Portugalcryptotax2025Client from './Portugalcryptotax2025Client'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Portugal Crypto Tax 2025 - CryptoNomadHub Blog',
  description: 'Portugal Crypto Tax 2025 - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <Portugalcryptotax2025Client />
    </PublicPageSSR>
  )
}
