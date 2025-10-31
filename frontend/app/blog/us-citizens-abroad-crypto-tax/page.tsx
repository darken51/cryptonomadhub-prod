import { PublicPageSSR } from '@/components/PublicPageSSR'
import UscitizensabroadcryptotaxClient from './UscitizensabroadcryptotaxClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'US Citizens Abroad Crypto Tax - CryptoNomadHub Blog',
  description: 'US Citizens Abroad Crypto Tax - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/us-citizens-abroad-crypto-tax'
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
            "headline": "US Citizens Abroad Crypto Tax - FATCA, FBAR, and Worldwide Taxation Guide",
            "description": "US Citizens Abroad Crypto Tax - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/us-citizens-abroad-crypto-tax",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <UscitizensabroadcryptotaxClient />
    </PublicPageSSR>
  )
}
