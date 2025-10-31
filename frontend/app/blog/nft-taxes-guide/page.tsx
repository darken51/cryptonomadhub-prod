import { PublicPageSSR } from '@/components/PublicPageSSR'
import NfttaxesguideClient from './NfttaxesguideClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NFT Taxes Guide - CryptoNomadHub Blog',
  description: 'NFT Taxes Guide - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/nft-taxes-guide'
  },
}

export default function BlogPostPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "NFT Taxes Guide - Complete Tax Treatment for NFT Creators and Traders",
            "description": "NFT Taxes Guide - Expert crypto tax insights and strategies.",
            "author": {
              "@type": "Organization",
              "name": "CryptoNomadHub"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CryptoNomadHub",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cryptonomadhub.io/logo.svg"
              }
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-10-31",
            "url": "https://cryptonomadhub.io/blog/nft-taxes-guide",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <NfttaxesguideClient />
    </PublicPageSSR>
  )
}
