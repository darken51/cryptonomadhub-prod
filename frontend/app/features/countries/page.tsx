import { PublicPageSSR } from '@/components/PublicPageSSR'
import CountriesFeatureClient from './CountriesFeatureClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '167 Country Tax Database - CryptoNomadHub',
  description: 'Comprehensive crypto tax regulations for 167 countries with verified data from official sources including PwC, OECD, KPMG, and government APIs.',
  openGraph: {
    title: '167 Country Tax Database - CryptoNomadHub',
    description: 'Comprehensive crypto tax regulations for 167 countries. Verified data from PwC, OECD, KPMG.',
    type: 'website',
  },
}

export default function CountriesFeaturePage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "167 Country Tax Database - CryptoNomadHub",
            "description": "Comprehensive crypto tax regulations for 167 countries with verified data from official sources including PwC, OECD, KPMG, and government APIs.",
            "url": "https://cryptonomadhub.io/features/countries"
          })
        }}
      />
      <CountriesFeatureClient />
    </PublicPageSSR>
  )
}
