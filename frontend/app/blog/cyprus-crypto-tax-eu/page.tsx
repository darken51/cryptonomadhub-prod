import { PublicPageSSR } from '@/components/PublicPageSSR'
import CypruscryptotaxeuClient from './CypruscryptotaxeuClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cyprus Crypto Tax in the EU - CryptoNomadHub Blog',
  description: 'Cyprus Crypto Tax in the EU - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <CypruscryptotaxeuClient />
    </PublicPageSSR>
  )
}
