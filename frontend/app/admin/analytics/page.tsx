'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { ExternalLink, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react'

interface AnalyticsService {
  name: string
  description: string
  dashboardUrl: string
  envVars: {
    key: string
    value?: string
    label: string
    required: boolean
  }[]
  status: 'configured' | 'partial' | 'missing'
  icon: string
}

export default function AnalyticsAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  const getEnvValue = (key: string): string | undefined => {
    if (typeof window === 'undefined') return undefined

    // In browser, we can't access process.env directly
    // These would need to be passed from server or API
    const publicVars: Record<string, string | undefined> = {
      'NEXT_PUBLIC_SENTRY_DSN': process.env.NEXT_PUBLIC_SENTRY_DSN,
      'NEXT_PUBLIC_POSTHOG_KEY': process.env.NEXT_PUBLIC_POSTHOG_KEY,
      'NEXT_PUBLIC_POSTHOG_HOST': process.env.NEXT_PUBLIC_POSTHOG_HOST,
      'NEXT_PUBLIC_PLAUSIBLE_DOMAIN': process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    }

    return publicVars[key]
  }

  const maskKey = (key: string): string => {
    if (!key || key.length < 8) return '••••••••'
    return key.slice(0, 8) + '•'.repeat(Math.max(key.length - 8, 8))
  }

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const services: AnalyticsService[] = [
    {
      name: 'Sentry',
      description: 'Error tracking, performance monitoring, and session replay',
      dashboardUrl: 'https://crypto-nomad-hub.sentry.io/issues/',
      icon: '🔴',
      envVars: [
        {
          key: 'NEXT_PUBLIC_SENTRY_DSN',
          value: getEnvValue('NEXT_PUBLIC_SENTRY_DSN'),
          label: 'Public DSN',
          required: true
        },
        {
          key: 'SENTRY_ORG',
          value: 'crypto-nomad-hub',
          label: 'Organization',
          required: true
        },
        {
          key: 'SENTRY_PROJECT',
          value: 'javascript-nextjs',
          label: 'Project',
          required: true
        },
        {
          key: 'SENTRY_AUTH_TOKEN',
          value: '(Set in Vercel)',
          label: 'Auth Token (for source maps)',
          required: false
        }
      ],
      status: getEnvValue('NEXT_PUBLIC_SENTRY_DSN') ? 'configured' : 'missing'
    },
    {
      name: 'PostHog',
      description: 'Product analytics: user behavior, funnels, feature usage',
      dashboardUrl: 'https://app.posthog.com',
      icon: '📈',
      envVars: [
        {
          key: 'NEXT_PUBLIC_POSTHOG_KEY',
          value: getEnvValue('NEXT_PUBLIC_POSTHOG_KEY'),
          label: 'Project API Key',
          required: true
        },
        {
          key: 'NEXT_PUBLIC_POSTHOG_HOST',
          value: getEnvValue('NEXT_PUBLIC_POSTHOG_HOST') || 'https://app.posthog.com',
          label: 'Host URL',
          required: true
        }
      ],
      status: getEnvValue('NEXT_PUBLIC_POSTHOG_KEY') ? 'configured' : 'missing'
    },
    {
      name: 'Plausible',
      description: 'Privacy-friendly website analytics (GDPR compliant)',
      dashboardUrl: 'https://plausible.io/cryptonomadhub.io',
      icon: '📉',
      envVars: [
        {
          key: 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN',
          value: getEnvValue('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') || 'cryptonomadhub.io',
          label: 'Domain',
          required: true
        }
      ],
      status: getEnvValue('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') ? 'configured' : 'missing'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Configured
          </span>
        )
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />
            Partial
          </span>
        )
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Not Configured
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Manage and monitor all analytics services in one place
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-slate-400 mb-2">Total Services</div>
            <div className="text-3xl font-bold text-white">{services.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-slate-400 mb-2">Configured</div>
            <div className="text-3xl font-bold text-green-400">
              {services.filter(s => s.status === 'configured').length}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="text-sm text-slate-400 mb-2">Missing</div>
            <div className="text-3xl font-bold text-red-400">
              {services.filter(s => s.status === 'missing').length}
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              {/* Service Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {service.name}
                    </h2>
                    <p className="text-slate-400 text-sm mb-3">
                      {service.description}
                    </p>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                <a
                  href={service.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Open Dashboard
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Environment Variables */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Configuration
                </h3>
                {service.envVars.map((envVar) => (
                  <div
                    key={envVar.key}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-slate-300">
                          {envVar.key}
                        </span>
                        {envVar.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {envVar.value && envVar.value !== '(Set in Vercel)' && (
                          <>
                            <button
                              onClick={() => setShowKeys({
                                ...showKeys,
                                [envVar.key]: !showKeys[envVar.key]
                              })}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              title={showKeys[envVar.key] ? 'Hide' : 'Show'}
                            >
                              {showKeys[envVar.key] ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(envVar.key, envVar.value!)}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              title="Copy"
                            >
                              {copiedKey === envVar.key ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{envVar.label}</span>
                      <code className="text-sm font-mono text-slate-400">
                        {envVar.value ? (
                          showKeys[envVar.key] ? envVar.value : maskKey(envVar.value)
                        ) : (
                          <span className="text-red-400">Not set</span>
                        )}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Setup Instructions */}
              {service.status === 'missing' && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-300 mb-2">
                    Setup Instructions
                  </h4>
                  <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                    <li>Create an account at {service.dashboardUrl}</li>
                    <li>Get your API key/credentials</li>
                    <li>Add them to Vercel environment variables</li>
                    <li>Redeploy the application</li>
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Events Tracked */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            📊 Events Being Tracked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-violet-300 mb-3">User Events</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  User signup (email + Google)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  User login (email + Google)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  User logout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  User identification (with tier)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-fuchsia-300 mb-3">Feature Usage</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Chat messages sent
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Tax simulations run
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  DeFi audits created
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Subscription upgrades (with revenue)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong className="text-blue-300">💡 Pro Tip:</strong> All analytics are GDPR-compliant with cookie consent.
            Users must accept cookies before tracking starts.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
