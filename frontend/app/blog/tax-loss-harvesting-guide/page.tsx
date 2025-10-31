import { PublicPageSSR } from '@/components/PublicPageSSR'
import TaxlossharvestingguideClient from './TaxlossharvestingguideClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tax Loss Harvesting Guide - CryptoNomadHub Blog',
  description: 'Tax Loss Harvesting Guide - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <TaxlossharvestingguideClient />
    </PublicPageSSR>
  )
}
