'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-400 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-violet-400 hover:text-violet-300 underline transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/countries"
              className="text-sm text-violet-400 hover:text-violet-300 underline transition-colors"
            >
              Countries
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/blog"
              className="text-sm text-violet-400 hover:text-violet-300 underline transition-colors"
            >
              Blog
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/help"
              className="text-sm text-violet-400 hover:text-violet-300 underline transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
