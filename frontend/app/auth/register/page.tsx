'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tCommon = useTranslations('common')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showToast(t('passwordMismatch'), 'error')
      return
    }

    if (password.length < 8) {
      showToast(t('weakPassword'), 'error')
      return
    }

    if (!acceptedTerms) {
      setShowDisclaimer(true)
      return
    }

    setIsLoading(true)

    try {
      await register(email, password)
      showToast('Account created successfully!', 'success')
      router.push('/dashboard')
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {showDisclaimer && (
        <LegalDisclaimer
          variant="modal"
          onAccept={() => {
            setAcceptedTerms(true)
            setShowDisclaimer(false)
          }}
        />
      )}

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {tCommon('email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {tCommon('password')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder={t('passwordPlaceholder')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('weakPassword')}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {tCommon('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder={t('confirmPasswordPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                  I understand that this tool is <strong>NOT financial, tax, or legal advice</strong>, and I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowDisclaimer(true)}
                className="text-xs text-blue-600 hover:underline ml-6"
              >
                → Read full legal disclaimer
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('creating') : t('submitButton')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('hasAccount')}{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            ← {tCommon('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
