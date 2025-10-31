import { PublicPageSSR } from '@/components/PublicPageSSR'
import FifolifohifocomparisonClient from './FifolifohifocomparisonClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FIFO vs LIFO vs HIFO Comparison - CryptoNomadHub Blog',
  description: 'FIFO vs LIFO vs HIFO Comparison - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <FifolifohifocomparisonClient />
    </PublicPageSSR>
  )
}
