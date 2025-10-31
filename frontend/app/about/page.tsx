import { PublicPageSSR } from '@/components/PublicPageSSR'
import AboutClient from './AboutClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us - CryptoNomadHub',
  description: 'Learn about CryptoNomadHub, our mission to help digital nomads optimize crypto taxes legally, and why you can trust our data from 167 countries.',
  alternates: {
    canonical: 'https://cryptonomadhub.io/about'
  },
  openGraph: {
    title: 'About CryptoNomadHub - Crypto Tax Platform for Digital Nomads',
    description: 'The most comprehensive crypto tax platform. Data from official sources across 167 countries, verified by AI, updated quarterly.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <PublicPageSSR>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About CryptoNomadHub",
            "description": "Learn about CryptoNomadHub, our mission to help digital nomads optimize crypto taxes legally across 167 countries.",
            "url": "https://cryptonomadhub.io/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "CryptoNomadHub",
              "url": "https://cryptonomadhub.io",
              "logo": "https://cryptonomadhub.io/logo.svg",
              "description": "AI-powered crypto tax optimization platform covering 167 countries with verified data from official government sources.",
              "foundingDate": "2024",
              "areaServed": "Worldwide",
              "serviceType": "Crypto Tax Information Platform",
              "knowsAbout": [
                "Cryptocurrency Taxation",
                "International Tax Law",
                "Digital Nomad Tax Optimization",
                "Tax Residency Planning",
                "DeFi Taxation"
              ]
            }
          })
        }}
      />
      <AboutClient />
    </PublicPageSSR>
  )
}
