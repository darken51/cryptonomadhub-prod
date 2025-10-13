'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import { setUserLocale } from '@/i18n/locale'
import { Locale } from '@/i18n/request'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'list'
  className?: string
}

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const locale = useLocale()
  const t = useTranslations('settings.preferences')

  const handleLanguageChange = async (newLocale: Locale) => {
    await setUserLocale(newLocale)
    window.location.reload()
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as Locale)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              locale === lang.code
                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">{lang.name}</p>
              {locale === lang.code && (
                <p className="text-xs text-blue-600 dark:text-blue-400">Current</p>
              )}
            </div>
            {locale === lang.code && (
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  return (
    <div className={`relative ${className}`}>
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        className="w-full appearance-none px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
