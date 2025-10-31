import { PublicPageSSR } from '@/components/PublicPageSSR'
import Bestcryptocountries2025Client from './Bestcryptocountries2025Client'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Best Crypto Countries 2025 - CryptoNomadHub Blog',
  description: 'Best Crypto Countries 2025 - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <Bestcryptocountries2025Client />
    </PublicPageSSR>
  )
}
