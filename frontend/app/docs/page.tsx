import { PublicPageSSR } from '@/components/PublicPageSSR'
import DocsClient from './DocsClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Documentation - CryptoNomadHub',
  description: 'Complete guides on AI country scoring, wallet connection, cost basis methods, DeFi audits, and wash sale detection. Step-by-step tutorials.',
}

export default function DocsPage() {
  return (
    <PublicPageSSR>
      <DocsClient />
    </PublicPageSSR>
  )
}
