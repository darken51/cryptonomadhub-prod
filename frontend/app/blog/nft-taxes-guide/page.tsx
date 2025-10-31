import { PublicPageSSR } from '@/components/PublicPageSSR'
import NfttaxesguideClient from './NfttaxesguideClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NFT Taxes Guide - CryptoNomadHub Blog',
  description: 'NFT Taxes Guide - Expert crypto tax insights and strategies.',
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <NfttaxesguideClient />
    </PublicPageSSR>
  )
}
