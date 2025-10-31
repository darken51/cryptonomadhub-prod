import { PublicPageSSR } from '@/components/PublicPageSSR'
import Portugalcryptotax2025Client from './Portugalcryptotax2025Client'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Portugal Crypto Tax 2025 - CryptoNomadHub Blog',
  description: 'Portugal Crypto Tax 2025 - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/portugal-crypto-tax-2025'
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
            "headline": "Portugal Crypto Tax 2025 - Complete Guide for Digital Nomads",
            "description": "Portugal Crypto Tax 2025 - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/portugal-crypto-tax-2025",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <Portugalcryptotax2025Client />
    </PublicPageSSR>
  )
}
