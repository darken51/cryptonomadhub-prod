'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Settings, Shield, BarChart3, Target } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: false,
    marketing: false,
    timestamp: 0,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const stored = localStorage.getItem('cookieConsent')
    if (!stored) {
      // Show banner after 1 second delay
      setTimeout(() => setIsVisible(true), 1000)
    } else {
      const parsed: CookiePreferences = JSON.parse(stored)
      setPreferences(parsed)
      // Apply consent (e.g., initialize analytics if accepted)
      if (parsed.analytics) {
        // Initialize analytics here (e.g., Google Analytics)
        console.log('✅ Analytics enabled')
      }
      if (parsed.marketing) {
        // Initialize marketing pixels here
        console.log('✅ Marketing enabled')
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    const toSave = { ...prefs, timestamp: Date.now() }
    localStorage.setItem('cookieConsent', JSON.stringify(toSave))
    setPreferences(toSave)
    setIsVisible(false)
    setShowSettings(false)

    // Apply consent
    if (toSave.analytics) {
      console.log('✅ Analytics enabled')
      // Initialize analytics here
    }
    if (toSave.marketing) {
      console.log('✅ Marketing enabled')
      // Initialize marketing pixels here
    }
  }

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    })
  }

  const rejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    })
  }

  const saveCustom = () => {
    savePreferences(preferences)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-900 border-t-2 border-violet-500 dark:border-violet-400 shadow-2xl animate-slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                🍪 We value your privacy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies. Read our{' '}
                <Link href="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/legal" className="text-violet-600 dark:text-violet-400 hover:underline font-semibold">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg hover:border-violet-500 dark:hover:border-violet-400 transition-all flex items-center gap-2 justify-center"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Cookie Settings</h2>
                  <p className="text-white/90 text-sm">Manage your cookie preferences</p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Essential Cookies */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Essential Cookies</h3>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                      Always Active
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Required for the website to function properly. These cookies enable basic features like page navigation,
                    authentication, and security. Cannot be disabled.
                  </p>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Examples: session_id, csrf_token, auth_token
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Help us understand how visitors interact with the website by collecting anonymous data.
                    Used to improve site performance and user experience.
                  </p>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Examples: Google Analytics, page views, session duration
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Marketing Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Used to track visitors across websites and display personalized ads.
                    Help us show you relevant content and measure ad campaign effectiveness.
                  </p>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Examples: Facebook Pixel, Google Ads, retargeting pixels
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-violet-700 dark:text-violet-300">ℹ️ Your Privacy Matters:</strong> You can change your preferences at any time by clicking the cookie icon in the footer.
                  For more information, read our{' '}
                  <Link href="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline font-semibold">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 rounded-b-2xl flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveCustom}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
