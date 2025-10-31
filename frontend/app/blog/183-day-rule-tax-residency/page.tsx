import { PublicPageSSR } from '@/components/PublicPageSSR'
import 183dayruletaxresidencyClient from './183dayruletaxresidencyClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '183-Day Rule and Tax Residency Guide - CryptoNomadHub Blog',
  description: '183-Day Rule and Tax Residency Guide - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <183dayruletaxresidencyClient />
    </PublicPageSSR>
  )
}
