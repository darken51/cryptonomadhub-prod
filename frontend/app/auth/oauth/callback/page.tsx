'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { trackLogin } from '@/lib/analytics'

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic'

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  )
}

/**
 * OAuth Callback Handler - Wrapped component that uses useSearchParams()
 */
function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    const processOAuthCallback = async () => {
      // Get tokens from URL params
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const error = searchParams.get('error')
      const message = searchParams.get('message')

      if (error) {
        // OAuth failed
        console.error('OAuth error:', error, message)
        showToast(
          message || 'Failed to sign in with Google. Please try again.',
          'error'
        )
        router.push('/auth/login')
        return
      }

      if (!accessToken || !refreshToken) {
        showToast('Invalid OAuth response. Please try again.', 'error')
        router.push('/auth/login')
        return
      }

      // Store tokens
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)

      // Refresh user data
      await refreshUser()

      // Track Google OAuth login (user will be identified in AuthProvider)
      trackLogin('google', 'oauth_user')

      // Show success message
      showToast('Successfully signed in with Google!', 'success')

      // Redirect to dashboard
      router.push('/dashboard')
    }

    processOAuthCallback()
  }, [searchParams, router, refreshUser, showToast])

  return <LoadingSpinner />
}

/**
 * OAuth Callback Page
 * Receives access_token and refresh_token from backend after successful OAuth
 * Stores tokens and redirects to dashboard
 */
export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OAuthCallbackHandler />
    </Suspense>
  )
}
