'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Header } from '@/components/Header'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'

interface PublicPageLayoutProps {
  children: React.ReactNode
  /** Optional: hide footer even for non-authenticated users (e.g., auth pages) */
  hideFooter?: boolean
  /** Optional: custom className for the content wrapper */
  contentClassName?: string
}

/**
 * Smart layout component for public pages that adapts based on authentication status:
 * - Shows AppHeader (with user menu) for logged-in users
 * - Shows Header (with Log In/Sign Up) for visitors
 * - Shows Footer only for non-authenticated users
 *
 * Usage:
 * ```tsx
 * <PublicPageLayout>
 *   <YourPageContent />
 * </PublicPageLayout>
 * ```
 */
export function PublicPageLayout({
  children,
  hideFooter = false,
  contentClassName = ''
}: PublicPageLayoutProps) {
  const { token } = useAuth()
  const isAuthenticated = !!token

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Show AppHeader for logged-in users, Header for visitors */}
      {isAuthenticated ? <AppHeader /> : <Header />}

      {/* Content area */}
      <div className={`flex-1 ${contentClassName}`}>
        {children}
      </div>

      {/* Show Footer only for non-authenticated users (unless explicitly hidden) */}
      {!isAuthenticated && !hideFooter && <Footer />}
    </div>
  )
}
