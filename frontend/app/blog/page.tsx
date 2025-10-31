import { PublicPageSSR } from '@/components/PublicPageSSR'
import BlogClient from './BlogClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Crypto Tax Blog - CryptoNomadHub',
  description: 'Expert articles on crypto tax strategies, country comparisons, DeFi guides, and regulatory news. Updated weekly with latest insights.',
}

export default function BlogPage() {
  return (
    <PublicPageSSR>
      <BlogClient />
    </PublicPageSSR>
  )
}
