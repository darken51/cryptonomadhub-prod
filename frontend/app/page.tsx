'use client'

import Link from 'next/link'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { Footer } from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="dropdown" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('hero.subtitle')}
            </p>
            <p className="text-sm text-gray-500">
              {t('hero.description')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {t('cta.getStarted')}
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {t('cta.login')}
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t('features.countries.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.countries.description')}
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t('features.aiChat.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.aiChat.description')}
              </p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
              <h3 className="text-lg font-semibold mb-2">{t('features.defiAudit.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.defiAudit.description')}
              </p>
              <span className="inline-block mt-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {tCommon('new')}
              </span>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t('features.pdfReports.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('features.pdfReports.description')}
              </p>
              <span className="inline-block mt-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {tCommon('new')}
              </span>
            </div>
          </div>

          {/* Pricing Teaser */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('pricing.teaser')}
            </p>
            <Link
              href="/pricing"
              className="text-blue-600 hover:underline font-semibold"
            >
              {t('pricing.viewPlans')}
            </Link>
          </div>

          {/* Legal Disclaimer */}
          <LegalDisclaimer variant="prominent" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
