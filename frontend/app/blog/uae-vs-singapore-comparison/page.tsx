import { PublicPageSSR } from '@/components/PublicPageSSR'
import UaevssingaporecomparisonClient from './UaevssingaporecomparisonClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'UAE vs Singapore Comparison - CryptoNomadHub Blog',
  description: 'UAE vs Singapore Comparison - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/uae-vs-singapore-comparison'
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
            "headline": "UAE vs Singapore Comparison - Best Crypto Tax Jurisdiction for Nomads",
            "description": "UAE vs Singapore Comparison - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/uae-vs-singapore-comparison",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <UaevssingaporecomparisonClient />
    </PublicPageSSR>
  )
}
