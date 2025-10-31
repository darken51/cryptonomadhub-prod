import { PublicPageSSR } from '@/components/PublicPageSSR'
import Germanycryptotaxchanges2025Client from './Germanycryptotaxchanges2025Client'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Germany Crypto Tax Changes 2025 - CryptoNomadHub Blog',
  description: 'Germany Crypto Tax Changes 2025 - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/germany-crypto-tax-changes-2025'
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
            "headline": "Germany Crypto Tax Changes 2025 - New Rules and Regulations",
            "description": "Germany Crypto Tax Changes 2025 - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/germany-crypto-tax-changes-2025",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <Germanycryptotaxchanges2025Client />
    </PublicPageSSR>
  )
}
