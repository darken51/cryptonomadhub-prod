import { PublicPageSSR } from '@/components/PublicPageSSR'
import DayRuleTaxResidencyClient from './DayRuleTaxResidencyClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '183-Day Rule and Tax Residency Guide - CryptoNomadHub Blog',
  description: '183-Day Rule and Tax Residency Guide - Expert crypto tax insights and strategies.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/blog/183-day-rule-tax-residency'
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
            "headline": "183-Day Rule and Tax Residency Guide - Everything Digital Nomads Need to Know",
            "description": "183-Day Rule and Tax Residency Guide - Expert crypto tax insights and strategies.",
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
            "url": "https://cryptonomadhub.io/blog/183-day-rule-tax-residency",
            "image": "https://cryptonomadhub.io/og-blog.png"
          })
        }}
      />
      <DayRuleTaxResidencyClient />
    </PublicPageSSR>
  )
}
