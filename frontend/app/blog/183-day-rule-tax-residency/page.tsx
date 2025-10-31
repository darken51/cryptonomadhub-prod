import { PublicPageSSR } from '@/components/PublicPageSSR'
import DayRuleTaxResidencyClient from './DayRuleTaxResidencyClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '183-Day Rule and Tax Residency Guide - CryptoNomadHub Blog',
  description: '183-Day Rule and Tax Residency Guide - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <DayRuleTaxResidencyClient />
    </PublicPageSSR>
  )
}
