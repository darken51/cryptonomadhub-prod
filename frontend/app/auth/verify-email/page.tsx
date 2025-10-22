'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. No token provided.')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.detail || 'Verification failed. Please try again.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please check your connection and try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              {status === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  <Loader2 className="w-16 h-16 text-violet-600 dark:text-fuchsia-400" />
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto" />
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto" />
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'success' && '✓ Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>

            {/* Message */}
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {message}
            </p>

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Redirecting to login page in 3 seconds...
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="inline-block w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Create New Account
                </Link>
                <Link
                  href="/"
                  className="inline-block w-full text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-fuchsia-400 transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
