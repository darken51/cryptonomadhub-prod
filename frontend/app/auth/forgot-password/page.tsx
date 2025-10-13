'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/providers/ToastProvider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to send reset email')
      }

      setIsSuccess(true)
      showToast('Password reset email sent! Check your inbox.', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to send reset email', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1 list-decimal list-inside text-left">
                <li>Check your email inbox</li>
                <li>Click the reset link (valid for 1 hour)</li>
                <li>Create a new password</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSuccess(false)
                  setEmail('')
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                try again
              </button>
            </div>

            <Link
              href="/auth/login"
              className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
              ← Back to login
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
