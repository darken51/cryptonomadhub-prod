import { PublicPageSSR } from '@/components/PublicPageSSR'
import SolanadefitaxesexplainedClient from './SolanadefitaxesexplainedClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Solana DeFi Taxes Explained - CryptoNomadHub Blog',
  description: 'Solana DeFi Taxes Explained - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/solana-defi-taxes-explained'
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
            "headline": "Solana DeFi Taxes Explained - Complete Guide for Traders",
            "description": "Solana DeFi Taxes Explained - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/solana-defi-taxes-explained",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <SolanadefitaxesexplainedClient />
    </PublicPageSSR>
  )
}
