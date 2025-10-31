import { PublicPageSSR } from '@/components/PublicPageSSR'
import Germanycryptotaxchanges2025Client from './Germanycryptotaxchanges2025Client'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Germany Crypto Tax Changes 2025 - CryptoNomadHub Blog',
  description: 'Germany Crypto Tax Changes 2025 - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <Germanycryptotaxchanges2025Client />
    </PublicPageSSR>
  )
}
