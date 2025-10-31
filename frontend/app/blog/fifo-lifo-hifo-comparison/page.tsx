import { PublicPageSSR } from '@/components/PublicPageSSR'
import FifolifohifocomparisonClient from './FifolifohifocomparisonClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FIFO vs LIFO vs HIFO Comparison - CryptoNomadHub Blog',
  description: 'FIFO vs LIFO vs HIFO Comparison - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/fifo-lifo-hifo-comparison'
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
            "headline": "FIFO vs LIFO vs HIFO Comparison - Crypto Cost Basis Methods Explained",
            "description": "FIFO vs LIFO vs HIFO Comparison - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/fifo-lifo-hifo-comparison",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <FifolifohifocomparisonClient />
    </PublicPageSSR>
  )
}
