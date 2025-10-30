'use client'

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortfolioRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to wallets page (portfolio tracking is integrated there)
    router.replace('/wallets')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to Portfolio...</p>
      </div>
    </div>
  )
}
