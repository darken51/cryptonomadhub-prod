import { PublicPageSSR } from '@/components/PublicPageSSR'
import UaevssingaporecomparisonClient from './UaevssingaporecomparisonClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'UAE vs Singapore Comparison - CryptoNomadHub Blog',
  description: 'UAE vs Singapore Comparison - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <UaevssingaporecomparisonClient />
    </PublicPageSSR>
  )
}
