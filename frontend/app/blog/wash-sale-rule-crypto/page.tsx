import { PublicPageSSR } from '@/components/PublicPageSSR'
import WashsalerulecryptoClient from './WashsalerulecryptoClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wash Sale Rule for Crypto - CryptoNomadHub Blog',
  description: 'Wash Sale Rule for Crypto - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/wash-sale-rule-crypto'
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
            "headline": "Wash Sale Rule for Crypto - How It Affects Your Tax Strategy",
            "description": "Wash Sale Rule for Crypto - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/wash-sale-rule-crypto",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <WashsalerulecryptoClient />
    </PublicPageSSR>
  )
}
