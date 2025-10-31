import { PublicPageSSR } from '@/components/PublicPageSSR'
import WashsalerulecryptoClient from './WashsalerulecryptoClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wash Sale Rule for Crypto - CryptoNomadHub Blog',
  description: 'Wash Sale Rule for Crypto - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <WashsalerulecryptoClient />
    </PublicPageSSR>
  )
}
