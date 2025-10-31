import { PublicPageSSR } from '@/components/PublicPageSSR'
import MultiCountryCompareClient from './MultiCountryCompareClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Multi-Country Compare - CryptoNomadHub',
  description: 'The only platform that lets you compare 2-5 countries simultaneously. See tax calculations, effective rates, and savings estimates all at once.',
  openGraph: {
    title: 'Multi-Country Compare - CryptoNomadHub',
    description: 'Compare 2-5 countries side-by-side. See tax calculations, effective rates, and savings estimates.',
    type: 'website',
  },
}

export default function MultiCountryComparePage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Multi-Country Compare - CryptoNomadHub",
            "description": "The only platform that lets you compare multiple countries simultaneously. See tax calculations, effective rates, and savings estimates all at once.",
            "url": "https://cryptonomadhub.com/features/multi-country-compare"
          })
        }}
      />
      <MultiCountryCompareClient />
    </PublicPageSSR>
  )
}
