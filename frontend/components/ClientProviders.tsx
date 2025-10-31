'use client'

import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'

/**
 * Client-side providers wrapper
 * Isolates client components to allow SSR for page content
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
