import { PublicPageSSR } from '@/components/PublicPageSSR'
import NomadsClient from './NomadsClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'For Digital Nomads - CryptoNomadHub',
  description: 'Find the perfect country for your digital nomad lifestyle. AI-powered country scoring evaluates 167 countries on crypto tax rates AND quality of life.',
  openGraph: {
    title: 'For Digital Nomads - CryptoNomadHub',
    description: 'AI-powered country scoring for crypto tax rates AND quality of life. Find your perfect nomad destination.',
    type: 'website',
  },
}

export default function DigitalNomadsPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "For Digital Nomads - Crypto Tax Optimization",
            "description": "Find the perfect country for your digital nomad lifestyle. AI-powered country scoring evaluates 167 countries on crypto tax rates AND quality of life.",
            "url": "https://cryptonomadhub.com/solutions/nomads"
          })
        }}
      />
      <NomadsClient />
    </PublicPageSSR>
  )
}
