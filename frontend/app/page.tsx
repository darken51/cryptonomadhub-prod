import { PublicPageSSR } from '@/components/PublicPageSSR'
import HomeClient from './HomeClient'
import { Metadata } from 'next'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'CryptoNomadHub - AI Crypto Tax Platform for Digital Nomads',
  description: 'Find which of 167 countries let you pay zero tax on cryptocurrencies. AI analyzes your situation and gives personalized relocation recommendations in 60 seconds.',
  openGraph: {
    title: 'CryptoNomadHub - AI Crypto Tax Platform for Digital Nomads',
    description: 'Find which of 167 countries let you pay zero tax on cryptocurrencies. AI-powered platform with crypto country scoring.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <PublicPageSSR>
      <HomeClient />
    </PublicPageSSR>
  )
}
