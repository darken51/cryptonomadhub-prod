import { PublicPageSSR } from '@/components/PublicPageSSR'
import PrivacyClient from './PrivacyClient'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy - CryptoNomadHub',
  description: 'Learn how CryptoNomadHub protects your data. Bank-level security, GDPR compliant, SOC 2 certified.',
}

export default function PrivacyPage() {
  return (
    <PublicPageSSR>
      <PrivacyClient />
    </PublicPageSSR>
  )
}
