import { PublicPageSSR } from '@/components/PublicPageSSR'
import TaxlossharvestingguideClient from './TaxlossharvestingguideClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tax Loss Harvesting Guide - CryptoNomadHub Blog',
  description: 'Tax Loss Harvesting Guide - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/tax-loss-harvesting-guide'
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
            "headline": "Tax Loss Harvesting Guide - Crypto Tax Optimization Strategy",
            "description": "Tax Loss Harvesting Guide - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/tax-loss-harvesting-guide",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <TaxlossharvestingguideClient />
    </PublicPageSSR>
  )
}
