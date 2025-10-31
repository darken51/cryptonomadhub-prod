import { PublicPageSSR } from '@/components/PublicPageSSR'
import CypruscryptotaxeuClient from './CypruscryptotaxeuClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cyprus Crypto Tax in the EU - CryptoNomadHub Blog',
  description: 'Cyprus Crypto Tax in the EU - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/cyprus-crypto-tax-eu'
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
            "headline": "Cyprus Crypto Tax in the EU - Tax Haven for European Crypto Nomads",
            "description": "Cyprus Crypto Tax in the EU - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/cyprus-crypto-tax-eu",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <CypruscryptotaxeuClient />
    </PublicPageSSR>
  )
}
